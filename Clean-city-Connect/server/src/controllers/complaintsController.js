import { query } from '../config/db.js';
import { analyzeImage } from '../services/visionService.js';

const REWARD_POINTS_PER_RESOLVE = 50;

// ─── CREATE COMPLAINT ───
export const createComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { description, wasteType, lat, lng, address, aiDescription, labels } = req.body;

    // Get media URLs from Cloudinary uploads
    const photoUrl = req.files?.photo?.[0]?.path || null;
    const videoUrl = req.files?.video?.[0]?.path || null;

    if (!photoUrl && !videoUrl) {
      return res.status(400).json({ message: 'At least one photo or video is required' });
    }

    // Parse labels (comes as JSON string from FormData)
    let parsedLabels = [];
    try {
      parsedLabels = labels ? JSON.parse(labels) : [];
    } catch {
      parsedLabels = labels ? [labels] : [];
    }

    const result = await query(
      `INSERT INTO complaints 
      (user_id, description, waste_type, location_lat, location_lng, address, photo_url, video_url, labels, ai_description) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [userId, description, wasteType || 'mixed', lat, lng, address, photoUrl, videoUrl, parsedLabels, aiDescription]
    );

    res.status(201).json({
      message: 'Complaint created successfully',
      complaint: result.rows[0],
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({ message: 'Failed to create complaint' });
  }
};

// ─── GET COMPLAINTS (citizen sees own, officer sees all) ───
export const getComplaints = async (req, res) => {
  try {
    const { role, id } = req.user;

    let result;
    if (role === 'officer') {
      result = await query(`
        SELECT c.*, u.name as user_name, u.phone as user_phone 
        FROM complaints c 
        LEFT JOIN users u ON c.user_id = u.id 
        ORDER BY c.created_at DESC
      `);
    } else {
      result = await query(
        'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
        [id]
      );
    }

    res.status(200).json({ complaints: result.rows });
  } catch (error) {
    console.error('Get Complaints Error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// ─── GET SINGLE COMPLAINT ───
export const getComplaintById = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const result = await query(
      `SELECT c.*, u.name as user_name, u.phone as user_phone 
       FROM complaints c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.id = $1`,
      [complaintId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Get Complaint Error:', error);
    res.status(500).json({ message: 'Failed to fetch complaint' });
  }
};

// ─── UPDATE COMPLAINT STATUS (officer action) ───
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { status, officerNote } = req.body;

    if (!['pending', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be pending, resolved, or rejected.' });
    }

    // Build dynamic update
    let updateQuery;
    let params;

    if (status === 'resolved') {
      updateQuery = `UPDATE complaints SET status = $1, resolved_at = CURRENT_TIMESTAMP, rejected_at = NULL, officer_note = $2 WHERE id = $3 RETURNING *`;
      params = [status, officerNote || null, complaintId];
    } else if (status === 'rejected') {
      updateQuery = `UPDATE complaints SET status = $1, rejected_at = CURRENT_TIMESTAMP, resolved_at = NULL, officer_note = $2 WHERE id = $3 RETURNING *`;
      params = [status, officerNote || null, complaintId];
    } else {
      updateQuery = `UPDATE complaints SET status = $1, resolved_at = NULL, rejected_at = NULL, officer_note = $2 WHERE id = $3 RETURNING *`;
      params = [status, officerNote || null, complaintId];
    }

    const result = await query(updateQuery, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = result.rows[0];

    // ─── REWARD POINTS on resolve ───
    if (status === 'resolved' && complaint.user_id) {
      // Add points to user
      await query(
        'UPDATE users SET reward_points = reward_points + $1 WHERE id = $2',
        [REWARD_POINTS_PER_RESOLVE, complaint.user_id]
      );

      // Create rewards history entry
      await query(
        `INSERT INTO rewards_history (user_id, complaint_id, points, description) 
         VALUES ($1, $2, $3, $4)`,
        [complaint.user_id, complaintId, REWARD_POINTS_PER_RESOLVE, `Complaint resolved – ${complaint.waste_type} waste`]
      );
    }

    res.status(200).json({
      message: `Complaint ${status} successfully`,
      complaint,
    });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
};

// ─── GET REWARDS HISTORY ───
export const getRewardsHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT rh.*, c.waste_type, c.photo_url 
       FROM rewards_history rh 
       LEFT JOIN complaints c ON rh.complaint_id = c.id 
       WHERE rh.user_id = $1 
       ORDER BY rh.created_at DESC`,
      [userId]
    );

    res.status(200).json({ rewards: result.rows });
  } catch (error) {
    console.error('Get Rewards Error:', error);
    res.status(500).json({ message: 'Failed to fetch rewards history' });
  }
};

// ─── PUBLIC STATS (for home page) ───
export const getPublicStats = async (req, res) => {
  try {
    const totalResult = await query('SELECT COUNT(*) as count FROM complaints');
    const resolvedResult = await query("SELECT COUNT(*) as count FROM complaints WHERE status = 'resolved'");
    const usersResult = await query("SELECT COUNT(*) as count FROM users WHERE role = 'citizen'");

    res.status(200).json({
      totalComplaints: parseInt(totalResult.rows[0].count) || 0,
      resolvedComplaints: parseInt(resolvedResult.rows[0].count) || 0,
      activeUsers: parseInt(usersResult.rows[0].count) || 0,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ─── PUBLIC COMPLAINTS FOR MAP VIEW ───
export const getPublicComplaints = async (req, res) => {
  try {
    const { status, wasteType } = req.query;
    
    let conditions = [];
    let params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (wasteType && wasteType !== 'all') {
      conditions.push(`waste_type = $${paramIndex}`);
      params.push(wasteType);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT id, waste_type, location_lat, location_lng, address, photo_url, status, labels, ai_description, created_at, resolved_at 
       FROM complaints ${whereClause} 
       ORDER BY created_at DESC`,
      params
    );

    res.status(200).json({ complaints: result.rows });
  } catch (error) {
    console.error('Get Public Complaints Error:', error);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// ─── ANALYZE MEDIA (Google Vision) ───
export const analyzeMedia = async (req, res) => {
  try {
    const photoUrl = req.files?.photo?.[0]?.path || null;

    if (!photoUrl) {
      return res.status(400).json({ message: 'Photo is required for AI analysis' });
    }

    const result = await analyzeImage(photoUrl);

    res.status(200).json({
      photoUrl,
      description: result.description,
      labels: result.labels,
      suggestedCategory: result.suggestedCategory || 'mixed',
    });
  } catch (error) {
    console.error('Analyze Media Error:', error);
    res.status(500).json({ message: 'AI analysis failed' });
  }
};
