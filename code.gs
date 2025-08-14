//分流Tavily
function getTavilyApiKey() {
  const properties = PropertiesService.getScriptProperties();
  const apiKey1 = properties.getProperty('TAVILY_API_KEY');
  const apiKey2 = properties.getProperty('TAVILY_API_KEY2');
  const now = new Date();
  const seconds = now.getSeconds();

  // 判斷秒數是奇數還是偶數
  if (seconds % 2 === 0) {
    // 偶數秒，使用 apiKey2
    return apiKey2;
  } else {
    // 奇數秒，使用 apiKey1
    return apiKey1;
  }
}

const TAVILY_API_KEY = getTavilyApiKey();
const Score_Lowbound = PropertiesService.getScriptProperties().getProperty('Score_Lowbound');

function doGet(e) {
  const query = e.parameter.q;
  const extractUrl = e.parameter.extract;
  const deepSearch = e.parameter.deepSearch === 'true';

  if (query) {
    return handleSearch(query, deepSearch);
  } else if (extractUrl) {
    return handleExtract(extractUrl);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ error: "請提供 ?q= 或 ?extract= 參數" }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function test(){
handleSearch("鬼滅之刃",false);
}

// 🔍 Tavily Search API
function handleSearch(query, deepSearch = false) {
  const apiUrl = 'https://api.tavily.com/search';
  const payload = {
    query: query,
    include_answer: true
  };

  // 如果是深度搜尋，加入 includeRawContent 參數
  if (deepSearch) {
    payload.include_raw_content = "markdown";
  }

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      'Authorization': `Bearer ${TAVILY_API_KEY}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const data = JSON.parse(response.getContentText());
console.log(data);
    let filtered = (data.results || [])
      .filter(r => r.score > Score_Lowbound && r.content)
      .map(r => ({
        content: r.content,
        url: r.url,
        rawContent: r.raw_content || ""
      }));
console.log(filtered);
    // 如果是深度搜尋，處理 markdown 內容並過濾圖片、連結
    if (deepSearch) {
      filtered = filtered.map(r => ({
        ...r,
        rawContent: filterMarkdown(r.rawContent)
      }));
    }

    const result = {
      answer: data.answer || "",
      contents: filtered,
      deepSearch: deepSearch
    };

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// 過濾 Markdown 內容，只移除圖片和過長的連結，保留 markdown 格式
function filterMarkdown(markdownText) {
  if (!markdownText) return "";
  
  let filtered = markdownText
    // 移除圖片語法 ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 移除連結語法 [text](url)，只保留 text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // 移除 HTML 標籤
    .replace(/<[^>]*>/g, '')
    // 移除多餘的空行（保留雙換行）
    .replace(/\n\s*\n\s*\n/g, '\n\n');
    
  return filtered.trim();
}

// 📄 Tavily Extract API
function handleExtract(url) {
  const extractUrl = 'https://api.tavily.com/extract';
  const payload = {
    urls: url,
    include_images: false,
    include_favicon: false,
    extract_depth: "basic",
    format: "markdown"
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    headers: {
      'Authorization': `Bearer ${TAVILY_API_KEY}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(extractUrl, options);
    const data = JSON.parse(response.getContentText());

    const result = (data.results && data.results.length > 0)
      ? { url: data.results[0].url, raw_content: filterMarkdown(data.results[0].raw_content) || "" }
      : { error: "No extract result returned." };

    return ContentService.createTextOutput(JSON.stringify(result))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

