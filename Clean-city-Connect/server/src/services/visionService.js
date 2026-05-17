
/**
 * Hugging Face Vision Service – Analyzes images for waste detection.
 * Uses Salesforce/blip-image-captioning-large via HF Inference API.
 */

/**
 * Analyze an image URL using Hugging Face Inference API (BLIP).
 * @param {string} imageUrl – Cloudinary URL of the uploaded image
 * @returns {{ description: string, labels: string[], suggestedCategory: string }}
 */
export async function analyzeImage(imageUrl) {
  const hfToken = process.env.HF_API_KEY;

  if (!hfToken || !imageUrl) {
    return {
      description: 'AI analysis unavailable',
      labels: [],
      suggestedCategory: 'mixed',
    };
  }

  try {
    const payload = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Describe this image of a public space in one short sentence, focusing on any waste, garbage, or cleanliness issues.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      model: process.env.HF_MODEL || "Qwen/Qwen3.5-9B:together",
    };

    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(payload),
    });

    // console.log(response)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('HF API Error Details:', JSON.stringify(errorData, null, 2));
      throw new Error(`HF API responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    let description = '';
    if (result.choices && result.choices.length > 0 && result.choices[0].message) {
      description = result.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from HF API');
    }

    // Since BLIP provides a single caption, we extract words to use as pseudo-labels
    const words = description.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
    const stopWords = ['this', 'that', 'with', 'from', 'there', 'some', 'what', 'into', 'they', 'their', 'them', 'when'];
    let allLabels = [...new Set(words.filter(w => !stopWords.includes(w)))];

    // Capitalize description
    description = description.charAt(0).toUpperCase() + description.slice(1) + '.';

    // Determine waste category from the caption
    const categoryMap = {
      wet: ['food', 'organic', 'vegetable', 'fruit', 'compost', 'biodegradable', 'leaf', 'leaves', 'dirt'],
      dry: ['paper', 'cardboard', 'newspaper', 'magazine', 'wood'],
      solid: ['plastic', 'bottle', 'metal', 'glass', 'container', 'can', 'cup', 'car', 'electronic'],
      mixed: ['waste', 'garbage', 'trash', 'litter', 'debris', 'dump', 'rubbish', 'pile', 'bag'],
    };

    let suggestedCategory = 'mixed';
    for (const [category, keywords] of Object.entries(categoryMap)) {
      if (allLabels.some(l => keywords.some(k => l.includes(k) || k.includes(l)))) {
        suggestedCategory = category;
        break;
      }
    }

    // Add extra context if it's detected as waste
    const wasteKeywords = ['waste', 'garbage', 'trash', 'litter', 'debris', 'rubbish', 'dump', 'pile'];
    const hasWaste = allLabels.some(l => wasteKeywords.some(k => l.includes(k)));
    if (hasWaste) {
      if (!description.toLowerCase().includes('detected')) {
        description = `Detected potential waste: ${description}`;
      }
    }

    return {
      description: description.trim(),
      labels: allLabels.slice(0, 8),
      suggestedCategory,
    };
  } catch (error) {
    console.error('Vision Analysis Error:', error);
    return {
      description: 'AI analysis failed – please describe manually',
      labels: [],
      suggestedCategory: 'mixed',
    };
  }
}
