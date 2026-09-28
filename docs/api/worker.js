/**
 * Cloudflare Worker for SAPatcher Guest Reviews Gateway
 * Developed for PixelSmith Studio (pixelsmith.ru)
 *
 * Deploy this on Cloudflare Workers (free tier: 100,000 requests/day).
 * Set secret environment variable GITHUB_TOKEN with issues:write permission.
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const data = await request.json();
      const author = (data.author || 'Гость').trim();
      const contactType = (data.contactType || 'Email').trim();
      const contactValue = (data.contactValue || '').trim();
      const rating = Math.min(5, Math.max(1, parseInt(data.rating, 10) || 5));
      const category = (data.category || 'GTA SA & Modding').trim();
      const title = (data.title || 'Отзыв о SAPatcher').trim();
      const pros = (data.pros || '').trim();
      const comment = (data.comment || '').trim();

      if (!contactValue) {
        return new Response(JSON.stringify({ error: 'Contact handle is required.' }), {
          status: 422,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const starString = '★'.repeat(rating) + '☆'.repeat(5 - rating);
      const issueBody = [
        `### Rating: ${starString} (${rating}/5)`,
        `**Category:** ${category}`,
        `**Author:** ${author} (Гость)`,
        `**Contact (${contactType}):** \`${contactValue}\``,
        '',
        pros ? `**Pros:**\n${pros}\n` : '',
        `### Detailed Review:\n${comment}`,
        '',
        '---',
        '_Submitted via Guest Form (without GitHub account) on [SAPatcher Official Website](https://passatb5by.github.io/SAPatch/) by [PixelSmith Studio](https://pixelsmith.ru)_'
      ].filter(Boolean).join('\n');

      const token = env.GITHUB_TOKEN;
      const ghRes = await fetch('https://api.github.com/repos/PassatB5By/SAPatch/issues', {
        method: 'POST',
        headers: {
          'User-Agent': 'PixelSmith-Review-Worker',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `[REVIEW] ${title}`,
          body: issueBody,
          labels: ['review']
        })
      });

      const ghData = await ghRes.text();
      return new Response(ghData, {
        status: ghRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
