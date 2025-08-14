const gasUrl = "https://script.google.com/macros/s/AKfycbwGvSAohbPly-hmIMNGfXNDCq-ifDP94k0TUfXEGWBvmLeojlpm5IkAJU0O2uZXeXVo/exec"
document.addEventListener('DOMContentLoaded', () => {
    const speechTypeRadios = document.querySelectorAll('input[name="speechType"]');
    const generateBtn = document.getElementById('generateBtn');
    const apiKeyInput = document.getElementById('apiKey');
    const materialInput = document.getElementById('material');
    const scriptOutput = document.getElementById('script-output');
    const wordCountSpan = document.getElementById('wordCount');
    const audioPlayer = document.getElementById('audio-player');
    const downloadLink = document.getElementById('download-link');
    const scriptStyleSelect = document.getElementById('scriptStyle');
    const scriptLengthInput = document.getElementById('scriptLength');
    const scriptLengthValueSpan = document.getElementById('scriptLengthValue');
    const generateAudioBtn = document.getElementById('generateAudioBtn');
    const audioOutputArea = document.getElementById('audio-output-area');
    const searchBtn = document.getElementById('searchBtn');
    const extractBtn = document.getElementById('extractBtn');
    const googleBtn = document.getElementById('googleBtn');
    const pdfBtn = document.getElementById('pdfBtn');
    const confirmSearchBtn = document.getElementById('confirmSearchBtn');
    const confirmExtractBtn = document.getElementById('confirmExtractBtn');
    const confirmGoogleBtn = document.getElementById('confirmGoogleBtn');
    const confirmPdfBtn = document.getElementById('confirmPdfBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    // Cover generation elements
    const coverGenerationArea = document.getElementById('cover-generation-area');
    const coverPrompt = document.getElementById('coverPrompt');
    const coverImageUpload = document.getElementById('coverImageUpload');
    const autoGeneratePromptBtn = document.getElementById('autoGeneratePromptBtn');
    const generateCoverBtn = document.getElementById('generateCoverBtn');
    const generatedImageArea = document.getElementById('generated-image-area');
    const generatedImage = document.getElementById('generated-image');
    const downloadCoverBtn = document.getElementById('downloadCoverBtn');

    // Get purpose description
    const purposeMap = {
        'podcast': 'Podcast節目，語調輕鬆自然，適合收聽',
        'education': '教育培訓，清晰易懂，具有教學性',
        'presentation': '商業簡報，專業正式，具說服力',
        'story': '故事分享，生動有趣，引人入勝',
        'news': '新聞播報，客觀準確，條理清晰',
        'entertainment': '娛樂節目，活潑幽默，富有感染力',
        'interview': '訪談節目，深入探討，具有啟發性',
        'motivation': '激勵演講，鼓舞人心，具有動力'
    };
    
    // Function to update word count
    function updateWordCount() {
        const text = scriptOutput.innerText.trim().length;
        wordCountSpan.textContent = text;
    }

    // Load API Key from localStorage
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
        apiKeyInput.value = storedApiKey;
    }

    const voices = [
        "Achernar(女)", "Achird(男)", "Aoede(女)", "Algieba(男)", "Algenib(男)", "Alnilam(男)", "Autonoe(女)",
        "Callirrhoe(女)", "Charon(男)", "Despina(女)", "Enceladus(男)", "Erinome(女)", "Fenrir(男)", "Gacrux(女)",
        "Iapetus(男)", "Kore(女)", "Laomedeia(女)", "Leda(女)", "Orus(男)", "Puck(男)", "Pulcherrima(女)", "Rasalgethi(男)",
        "Sadachbia(男)", "Sadaltager(男)", "Schedar(男)", "Sulafat(女)", "Umbriel(男)", "Vindemiatrix(女)",
        "Zephyr(女)", "Zubenelgenubi(男)"
    ];

    function updateVoiceSelectionUI() {
        const selectedType = document.querySelector('input[name="speechType"]:checked').value;
        const voiceSelectionDiv = document.getElementById('voice-selection');
        voiceSelectionDiv.innerHTML = ''; // Clear previous options

        if (selectedType === 'solo') {
            voiceSelectionDiv.appendChild(createVoiceDropdown('voice1'));
        } else {
            voiceSelectionDiv.appendChild(createVoiceDropdown('voice1'));
            voiceSelectionDiv.appendChild(createVoiceDropdown('voice2'));
        }
    }

    function createVoiceDropdown(id) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('mb-4');

        // Container for voice dropdown and name input
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('flex', 'items-center', 'space-x-2'); // Using flexbox for inline alignment

        // Voice selection dropdown
        const select = document.createElement('select');
        select.id = id;
        select.classList.add('voice-dropdown', 'flex-grow'); // flex-grow to take available space

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇語音...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.split('(')[0].trim();
            option.textContent = voice;
            select.appendChild(option);
        });

        // Speaker name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = id + '_name';
        nameInput.classList.add('w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-lg', 'focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent', 'transition-all', 'duration-200');
        nameInput.placeholder = '講者名稱 (選填)';

        inputGroup.appendChild(select);
        inputGroup.appendChild(nameInput);
        wrapper.appendChild(inputGroup);

        return wrapper;
    }

    async function handleGenerateScript() {
        const apiKey = apiKeyInput.value.trim();
        const material = materialInput.value.trim();
        const speechType = document.querySelector('input[name="speechType"]:checked').value;
        const scriptStyle = scriptStyleSelect.value;
        const scriptLength = scriptLengthInput.value;

        // Validation
        if (!apiKey) {
            showAlert('error', '❌ 請輸入您的 Gemini API 金鑰');
            return;
        }
        if (!material) {
            showAlert('error', '❌ 請輸入素材內容');
            return;
        }

        // Check voice selection
        if (speechType === 'duo') {
            const voice1 = document.getElementById('voice1')?.value;
            const voice2 = document.getElementById('voice2')?.value;
            if (!voice1 || !voice2) {
                showAlert('error', '❌ 雙人模式請選擇兩個語音');
                return;
            }
            if (voice1 === voice2) {
                showAlert('error', '❌ 請選擇兩個不同的語音');
                return;
            }
        } else {
            const voice1 = document.getElementById('voice1')?.value;
            if (!voice1) {
                showAlert('error', '❌ 請選擇語音');
                return;
            }
        }

        // 顯示預估參數
        const targetMinutes = scriptLength / 60;
        const estimatedWords = 180 * targetMinutes;
        const maxTokens = Math.min(Math.max(estimatedWords * 2, 500), 8000);
        console.log(`講稿參數：${scriptLength}秒 (${targetMinutes.toFixed(1)}分鐘)，預估${Math.round(estimatedWords)}字，maxTokens: ${Math.round(maxTokens)}`);

        try {
            const script = await generateScript(apiKey, material, speechType, scriptStyle, scriptLength);
            scriptOutput.textContent = script;
            showAlert('success', '✅ 講稿生成完成！您可以編輯內容後再生成音檔');
            updateWordCount();

        } catch (error) {
            console.error('Error in handleGenerateScript:', error);
            showAlert('error', `❌ 生成講稿失敗: ${error.message}`);
        } finally {
            console.log('handleGenerateScript 執行結束。');
        }
    }

    async function handleGenerateAudio() {
        const apiKey = apiKeyInput.value.trim();
        const script = scriptOutput.textContent.trim();
        const speechType = document.querySelector('input[name="speechType"]:checked').value;

        if (!apiKey) {
            showAlert('error', '❌ 請輸入您的 Gemini API 金鑰');
            return;
        }
        if (!script) {
            showAlert('error', '❌ 請先生成講稿');
            return;
        }

        audioPlayer.src = '';
        downloadLink.href = '#';
        audioOutputArea.classList.add('hidden');

        try {
            const audioBase64 = await generateSpeech(apiKey, script, speechType);
            
            if (!audioBase64) {
                // 如果 generateSpeech 返回空值（token 超限），直接返回
                return;
            }
            
            const pcmBytes = base64ToUint8Array(audioBase64);
            const durationInSeconds = (pcmBytes.length / 2) / 24000;
            console.log('音訊長度:', durationInSeconds.toFixed(2), '秒');
            
            const audioBlob = createWavBlob(pcmBytes);
            const audioUrl = URL.createObjectURL(audioBlob);
            
            audioPlayer.src = audioUrl;
            downloadLink.href = audioUrl;
            downloadLink.download = 'speech.wav';
            audioOutputArea.classList.remove('hidden');
            
            const minutes = Math.floor(durationInSeconds / 60);
            const seconds = Math.floor(durationInSeconds % 60);
            const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
            
            showAlert('success', `✅ 音檔生成完成！`);

        } catch (error) {
            console.error('Error:', error);
            showAlert('error', `❌ 生成音檔失敗: ${error.message}`);
        }
    }
    
    async function generateScript(apiKey, material, speechType, scriptStyle, scriptLength) {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const purposeDescription = purposeMap[scriptStyle] || '專業內容';

        // 根據講稿長度動態計算 maxOutputTokens
        // 一般來說，中文約 150-200 字/分鐘，1 中文字約 1.5-2 tokens
        const wordsPerMinute = 180; // 中文每分鐘字數
        const tokensPerWord = 2; // 每字約 2 tokens
        const targetMinutes = scriptLength / 60;
        const estimatedWords = wordsPerMinute * targetMinutes;// 限制在 500-8000 之間

        let prompt;

        if (speechType === 'solo') {
            const voice1 = document.getElementById('voice1').value;
            const speaker1Name = document.getElementById('voice1_name')?.value || voice1;
            
            prompt = `請將以下素材轉換成一篇約${scriptLength}秒鐘的繁體中文單人講稿，用途為${purposeDescription}。講者名稱是「${speaker1Name}」。
            
要求：
- 語調和風格要符合${purposeDescription}的特性
- 內容要流暢自然，適合語音播報
- 只需要演講內容，不要有標題或其他額外文字
- 時長控制在${scriptLength}秒左右，約${Math.round(estimatedWords)}個字
- 皆使用台灣用語、台灣連接詞，可以適時使用台灣狀聲詞。

素材：
${material}`;
        } else {
            const voice1 = document.getElementById('voice1').value;
            const voice2 = document.getElementById('voice2').value;
            const speaker1Name = document.getElementById('voice1_name')?.value || voice1;
            const speaker2Name = document.getElementById('voice2_name')?.value || voice2;
            
            prompt = `請將以下素材轉換成一段約${scriptLength}秒鐘的繁體中文雙人對話腳本，用途為${purposeDescription}。
            
兩位講者：
- 第一位：${speaker1Name}
- 第二位：${speaker2Name}

要求：
- 對話要自然流暢，符合${purposeDescription}的特性
- 請用「${speaker1Name}:」和「${speaker2Name}:」的格式來區分對白
- 兩人要有互動和討論，不是各自獨白
- 只需要演講內容，不要有標題或其他額外文字
- 時長控制在${scriptLength}秒左右，約${Math.round(estimatedWords)}個字
- 皆使用台灣用語、台灣連接詞，可以適時使用台灣狀聲詞。

範例格式：
${speaker1Name}: 大家好，我是${speaker1Name}...
${speaker2Name}: 嗨，我是${speaker2Name}...

素材：
${material}`;
        }

        const requestBody = {
            "contents": [{
                "parts": [{ "text": prompt }]
            }],
            "generationConfig": {
                "temperature": 0.8,
                "thinkingConfig": {
                    "thinkingBudget": 0,
                },
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`生成講稿失敗: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // Token 計算函數
    async function countTokens(apiKey, text) {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:countTokens?key=${apiKey}`;
        
        const requestBody = {
            "contents": [{
                "parts": [{
                    "text": text
                }]
            }]
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Token 計算失敗: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.totalTokens;
    }

    async function generateSpeech(apiKey, script, speechType) {
        // 檢查 token 數量
        try {
            const tokenCount = await countTokens(apiKey, script);
            
            // 如果內容過長，自動分段處理
            if (tokenCount > 4000 || script.length > 3000) {
                //showAlert('info', '📝 檢測到較長內容，將自動分段生成音檔...');
                return await generateSegmentedSpeech(apiKey, script, speechType);
            }

        } catch (error) {
            console.warn('Token 計算失敗，繼續進行 TTS:', error);
        }

        return await generateSingleSegment(apiKey, script, speechType);
    }

    // 分段生成音檔功能
    async function generateSegmentedSpeech(apiKey, script, speechType) {
        const segments = splitScriptIntoSegments(script, speechType);
        const audioSegments = [];
        let totalDuration = 0;

        console.log(`開始分段生成，共 ${segments.length} 段：`, segments);
        showLoadingOverlay(`🔊 正在分段生成音檔 (0/${segments.length})...`);

        for (let i = 0; i < segments.length; i++) {
            try {
                loadingText.textContent = `🔊 正在生成第 ${i + 1}/${segments.length} 段音檔...`;
                const segmentAudioBase64 = await generateSingleSegment(apiKey, segments[i], speechType);
                const pcmBytes = base64ToUint8Array(segmentAudioBase64);
                const duration = (pcmBytes.length / 2) / 24000;
                totalDuration += duration;
                
                audioSegments.push(pcmBytes);                
            } catch (error) {
                //throw new Error(`第 ${i + 1} 段生成失敗: ${error.message}`);
                showAlert('info', `第 ${i + 1} 段生成失敗: ${error.message}`);
            }
        }

        // 合併所有音檔片段
        loadingText.textContent = '🔗 正在合併音檔片段...';
        const mergedAudio = mergeAudioSegments(audioSegments);
        
        console.log(`分段生成完成！總共 ${segments.length} 段，總長度: ${totalDuration.toFixed(2)} 秒`);
        return uint8ArrayToBase64(mergedAudio);
    }

    // 將講稿分割成段落
    function splitScriptIntoSegments(script, speechType) {
        const maxLength = 2500; // 每段最大字符數
        const segments = [];
        
        if (speechType === 'solo') {
            // 單人講稿：按段落和句號分割
            const paragraphs = script.split(/\n\s*\n/);
            let currentSegment = '';
            
            for (const sentence of sentences) {
                if (sentence.trim()) {
                    const fullSentence = sentence.trim() + '。';
                    
                    if (currentSegment.length + fullSentence.length <= maxLength && currentSegment) {
                        currentSegment += fullSentence;
                    } else {
                        if (currentSegment) {
                            segments.push(currentSegment.trim());
                        }
                        currentSegment = fullSentence;
                    }
                }
            }
            
            if (currentSegment) {
                segments.push(currentSegment.trim());
            }
            
        } else {
            // 雙人對話：按對話輪次分割
            const lines = script.split('\n').filter(line => line.trim());
            let currentSegment = '';
            
            for (const line of lines) {
                if (currentSegment.length + line.length + 1 <= maxLength) {
                    currentSegment += (currentSegment ? '\n' : '') + line;
                } else {
                    if (currentSegment) {
                        segments.push(currentSegment.trim());
                    }
                    currentSegment = line;
                }
            }
            
            if (currentSegment) {
                segments.push(currentSegment.trim());
            }
        }
        
        return segments.filter(segment => segment.length > 0);
    }

    // 生成單個片段
    async function generateSingleSegment(apiKey, segmentScript, speechType) {
        const model = 'gemini-2.5-flash-preview-tts';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let requestBody;
        if (speechType === 'solo') {
            const voice1 = document.getElementById('voice1').value;
            const emotionalDescription = purposeMap[scriptStyleSelect.value] || '專業內容';
            requestBody = {
                "contents": [{
                    "parts": [{
                        "text": `請以${emotionalDescription}的語氣讀出以下講稿片段：` + segmentScript
                    }]
                }],
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {
                        "voiceConfig": {
                            "prebuiltVoiceConfig": {
                                "voiceName": voice1
                            }
                        }
                    }
                }
            };
        } else {
            const voice1 = document.getElementById('voice1').value;
            const voice2 = document.getElementById('voice2').value;
            const speaker1Name = document.getElementById('voice1_name')?.value || voice1;
            const speaker2Name = document.getElementById('voice2_name')?.value || voice2;
            
            const voice1Gender = voices.find(v => v.startsWith(voice1))?.includes('女') ? 'female' : 'male';
            const voice2Gender = voices.find(v => v.startsWith(voice2))?.includes('女') ? 'female' : 'male';
            const emotionalDescription = purposeMap[scriptStyleSelect.value] || '專業內容';
            
            const ttsPrompt = `請以${emotionalDescription}的語氣生成以下對話片段的語音。\n講者「${speaker1Name}」應保持一致的 ${voice1Gender} 語音特性。\n講者「${speaker2Name}」應保持一致的 ${voice2Gender} 語音特性。\n對話片段：\n${segmentScript}`;

            requestBody = {
                "contents": [{
                    "parts": [{
                        "text": ttsPrompt
                    }]
                }],
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {
                        "multiSpeakerVoiceConfig": {
                            "speakerVoiceConfigs": [{
                                "speaker": speaker1Name,
                                "voiceConfig": {
                                    "prebuiltVoiceConfig": {
                                        "voiceName": voice1
                                    }
                                }
                            }, {
                                "speaker": speaker2Name,
                                "voiceConfig": {
                                    "prebuiltVoiceConfig": {
                                        "voiceName": voice2
                                    }
                                }
                            }]
                        }
                    }
                }
            };
        }
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            //throw new Error(`語音合成失敗: ${errorData.error?.message || response.statusText}`);
            showAlert('info', `語音合成失敗: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && 
            data.candidates[0].content.parts && data.candidates[0].content.parts[0] && 
            data.candidates[0].content.parts[0].inlineData) {
            return data.candidates[0].content.parts[0].inlineData.data;
        } else {
            //throw new Error('回應格式錯誤：找不到音檔內容');
            showAlert('info', '回應格式錯誤：找不到音檔內容');
            return null;
        }
    }

    // 合併音檔片段
    function mergeAudioSegments(segments) {
        let totalLength = 0;
        segments.forEach(segment => {
            totalLength += segment.length;
        });
        
        const merged = new Uint8Array(totalLength);
        let offset = 0;
        
        segments.forEach(segment => {
            merged.set(segment, offset);
            offset += segment.length;
        });
        
        return merged;
    }

    // 新增：Uint8Array 轉 Base64
    function uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    async function fetchGroundingData(apiKey, query) {
        const model = 'gemini-2.5-flash'; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            "contents": [{
                "parts": [{
                    "text": `"${query}" `
                }]
            }],
            "tools": [{
                "googleSearch": {}
            }],
            "safetySettings": [
                { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
                { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
                { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
                { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
            ],
            "generationConfig": {
                "thinkingConfig": {
                    "thinkingBudget": 0,
                },
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google Search Grounding 失敗: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        // Grounding 結果通常在 candidates[0].content.parts[0].text
        return data.candidates[0].content.parts[0].text;
    }

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function createWavBlob(pcmBytes) {
        const sampleRate = 24000; // Gemini TTS 的標準取樣率
        const numChannels = 1;     // 單聲道
        const bitsPerSample = 16;  // 16-bit 音訊

        // 確保 PCM 數據長度是偶數（16位音訊）
        let actualPcmData = pcmBytes;
        if (pcmBytes.length % 2 !== 0) {
            // 如果是奇數長度，添加一個0字節
            actualPcmData = new Uint8Array(pcmBytes.length + 1);
            actualPcmData.set(pcmBytes);
            actualPcmData[pcmBytes.length] = 0;
            console.log(`WAV: 調整PCM數據長度從 ${pcmBytes.length} 到 ${actualPcmData.length}`);
        }

        const pcmDataSize = actualPcmData.length;
        const blockAlign = numChannels * bitsPerSample / 8;
        const byteRate = sampleRate * blockAlign;
        
        // WAV 檔案頭共 44 位元組
        const headerSize = 44;
        const buffer = new ArrayBuffer(headerSize + pcmDataSize);
        const view = new DataView(buffer);

        // 寫入 WAV 檔案頭
        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        // RIFF chunk descriptor
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + pcmDataSize, true); // 檔案大小 - 8
        writeString(view, 8, 'WAVE');
        // "fmt " sub-chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // PCM 的 sub-chunk 大小為 16
        view.setUint16(20, 1, true);  // 音訊格式 (1 = PCM)
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        // "data" sub-chunk
        writeString(view, 36, 'data');
        view.setUint32(40, pcmDataSize, true);

        // 將 PCM 資料寫入檔案頭之後
        const pcmData = new Uint8Array(buffer, headerSize);
        pcmData.set(actualPcmData);

        return new Blob([buffer], { type: 'audio/wav' });
    }

    // Alert system for better user feedback
    function showAlert(type, message) {
        const alertModal = document.getElementById('alertModal');
        const alertContent = document.getElementById('alertContent');
        
        let bgColor = '';
        let textColor = '';

        switch(type) {
            case 'success':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                break;
            case 'info':
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                break;
            case 'error':
            default:
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                break;
        }

        alertContent.className = `p-6 rounded-lg shadow-xl text-center max-w-sm mx-4 transform transition-all duration-300 scale-100 ${bgColor} ${textColor}`;
        alertContent.innerHTML = `<p class="text-lg font-semibold">${message}</p>`;
        
        alertModal.classList.remove('hidden');

        // Auto-remove after 3 seconds
        setTimeout(() => {
            alertModal.classList.add('hidden');
        }, 3000);
    }

    // Auto-save API key functionality
    function setupAutoSave() {
        let saveTimeout;
        apiKeyInput.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('geminiApiKey', apiKeyInput.value);
            }, 500); // Save after 500ms of no typing
        });
    }

    // Enhanced script length display with better formatting
    function updateScriptLengthDisplay() {
        const minutes = Math.floor(scriptLengthInput.value / 60);
        const seconds = scriptLengthInput.value % 60;
        const timeText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        scriptLengthValueSpan.textContent = timeText;
    }

    // Modal and overlay functions
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.querySelector('.bg-white').classList.add('modal-enter');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    function showLoadingOverlay(text = '處理中，請稍候...') {
        loadingText.textContent = text;
        loadingOverlay.classList.remove('hidden');
    }

    function hideLoadingOverlay() {
        loadingOverlay.classList.add('hidden');
    }

    // PDF processing functions
    async function handlePdfUpload() {
        const fileInput = document.getElementById('pdfFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            showAlert('error', '❌ 請選擇 PDF 檔案');
            return;
        }
        
        if (file.type !== 'application/pdf') {
            showAlert('error', '❌ 請選擇有效的 PDF 檔案');
            return;
        }
        
        closeModal('pdfModal');
        showLoadingOverlay('📄 正在讀取 PDF 內容，請稍候...');
        
        try {
            const text = await extractTextFromPdf(file);
            
            if (text.trim()) {
                const currentMaterial = materialInput.value;
                const separator = currentMaterial ? '\n\n--- PDF 內容 ---\n' : '';
                const pdfContent = `${separator}檔案「${file.name}」內容：\n${text}`;
                
                materialInput.value = currentMaterial + pdfContent;
                showAlert('success', '✅ PDF 內容讀取完成！');
            } else {
                showAlert('error', '❌ 無法從 PDF 中提取文字內容');
            }
        } catch (error) {
            console.error('PDF processing error:', error);
            showAlert('error', `❌ PDF 讀取失敗: ${error.message}`);
        } finally {
            hideLoadingOverlay();
            fileInput.value = ''; // Clear the file input
        }
    }
    
    async function extractTextFromPdf(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            
            fileReader.onload = async function() {
                try {
                    // 設置 PDF.js worker
                    if (typeof pdfjsLib !== 'undefined') {
                        pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
                    }
                    
                    const typedarray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let fullText = '';
                    
                    // 處理每一頁
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        
                        const pageText = textContent.items
                            .map(item => item.str)
                            .join(' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        if (pageText) {
                            fullText += pageText + '\n\n';
                        }
                    }
                    
                    resolve(fullText.trim());
                } catch (error) {
                    reject(new Error('PDF 解析失敗: ' + error.message));
                }
            };
            
            fileReader.onerror = function() {
                reject(new Error('檔案讀取失敗'));
            };
            
            fileReader.readAsArrayBuffer(file);
        });
    }

    // Tavily API functions
    async function handleKeywordSearch() {
        const keyword = document.getElementById('searchKeyword').value.trim();
        const deepSearch = document.getElementById('deepSearch').checked;
        if (!keyword) {
            showAlert('error', '❌ 請輸入搜尋關鍵字');
            return;
        }

        closeModal('searchModal');
        showLoadingOverlay('🔍 正在搜尋資料，請稍候...');

        try {
            const response = await fetch(`${gasUrl}?q=${encodeURIComponent(keyword)}&deepSearch=${deepSearch}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.answer) {
                const currentMaterial = materialInput.value;
                const separator = currentMaterial ? '\n' : '';
                let searchResults = `${data.answer}\n`;
                
                if (deepSearch && data.contents && data.contents.length > 0) {
                    // 使用深度搜尋回傳的 rawContent，已經過濾過的內容
                    const deepContents = data.contents
                        .filter(item => item.rawContent && item.rawContent.trim())
                        .map(item => `\n來源：${item.url}\n${item.rawContent}`)
                        .join('\n\n---\n\n');
                    
                    if (deepContents) {
                        searchResults += `\n\n=== 詳細內容 ===\n${deepContents}`;
                    }
                }
                
                materialInput.value = currentMaterial + separator + searchResults;
                
                const resultMessage = deepSearch ? 
                    `✅ 深度搜尋完成！找到 ${data.contents?.length || 0} 個相關資料源` :
                    '✅ 關鍵字搜尋完成！找到相關資料';
                showAlert('success', resultMessage);
            } else {
                showAlert('error', '❌ 搜尋無結果，請嘗試其他關鍵字');
            }
        } catch (error) {
            console.error('Search error:', error);
            showAlert('error', `❌ 搜尋失敗: ${error.message}`);
        } finally {
            hideLoadingOverlay();
            document.getElementById('searchKeyword').value = '';
        }
    }

    async function handleUrlExtract() {
        const url = document.getElementById('extractUrl').value.trim();
        if (!url) {
            showAlert('error', '❌ 請輸入網址');
            return;
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            showAlert('error', '❌ 請輸入有效的網址 (需以 http:// 或 https:// 開頭)');
            return;
        }

        closeModal('extractModal');
        showLoadingOverlay('🌐 正在擷取網頁內容，請稍候...');

        try {
            const response = await fetch(`${gasUrl}?extract=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.raw_content) {
                const currentMaterial = materialInput.value;
                const separator = currentMaterial ? '\n\n--- 網頁內容 ---\n' : '';
                const extractedContent = `${separator}網址「${url}」內容摘要：\n${data.raw_content}`;
                
                materialInput.value = currentMaterial + extractedContent;
                showAlert('success', `✅ 網頁內容擷取完成！`);
            } else {
                showAlert('error', '❌ 無法擷取網頁內容，請檢查網址是否正確');
            }
        } catch (error) {
            console.error('Extract error:', error);
            showAlert('error', `❌ 網頁擷取失敗: ${error.message}`);
        } finally {
            hideLoadingOverlay();
            document.getElementById('extractUrl').value = '';
        }
    }

    async function handleGoogleSearch() {
        const query = document.getElementById('googleQuery').value.trim();
        if (!query) {
            showAlert('error', '❌ 請輸入搜尋內容');
            return;
        }

        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showAlert('error', '❌ 請輸入您的 Gemini API 金鑰');
            return;
        }

        closeModal('googleModal');
        showLoadingOverlay('🔎 正在進行 Google 搜尋，請稍候...');

        try {
            const response = await fetchGroundingData(apiKey, query);
            if (response) {
                const currentMaterial = materialInput.value;
                materialInput.value = currentMaterial + (currentMaterial ? '\n\n' : '') + response;
                showAlert('success', '✅ Google 搜尋完成！已加入相關資料');
            } else {
                showAlert('error', '❌ 搜尋無結果，請嘗試其他關鍵字');
            }
        } catch (error) {
            console.error('Google search error:', error);
            showAlert('error', `❌ Google 搜尋失敗: ${error.message}`);
        } finally {
            hideLoadingOverlay();
            document.getElementById('googleQuery').value = '';
        }
    }

    // Enhanced generate functions with loading overlay
    async function handleGenerateScriptWithOverlay() {
        showLoadingOverlay('✨ 正在生成講稿，請稍候...');
        try {
            await handleGenerateScript();
        } finally {
            hideLoadingOverlay();
        }
    }

    async function handleGenerateAudioWithOverlay() {
        showLoadingOverlay('🔊 正在生成音檔，請稍候...');
        try {
            await handleGenerateAudio();
        } finally {
            hideLoadingOverlay();
        }
    }

    // Make closeModal globally accessible
    window.closeModal = closeModal;

    // Event listeners for new buttons
    searchBtn.addEventListener('click', () => showModal('searchModal'));
    extractBtn.addEventListener('click', () => showModal('extractModal'));
    googleBtn.addEventListener('click', () => showModal('googleModal'));
    pdfBtn.addEventListener('click', () => showModal('pdfModal'));
    confirmSearchBtn.addEventListener('click', handleKeywordSearch);
    confirmExtractBtn.addEventListener('click', handleUrlExtract);
    confirmGoogleBtn.addEventListener('click', handleGoogleSearch);
    confirmPdfBtn.addEventListener('click', handlePdfUpload);

    // Enter key support for modals
    document.getElementById('searchKeyword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleKeywordSearch();
        }
    });

    document.getElementById('extractUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUrlExtract();
        }
    });

    document.getElementById('googleQuery').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGoogleSearch();
        }
    });

    document.getElementById('pdfFileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            // 檔案選擇後自動啟用讀取按鈕
            confirmPdfBtn.disabled = false;
        }
    });

    // Cover generation functions
    async function handleAutoGeneratePrompt() {
        const apiKey = apiKeyInput.value.trim();
        const script = scriptOutput.textContent.trim();
        const material = materialInput.value.trim();
        
        if (!apiKey) {
            showAlert('error', '❌ 請輸入您的 Gemini API 金鑰');
            return;
        }
        
        if (!script && !material) {
            showAlert('error', '❌ 請先生成講稿或輸入素材');
            return;
        }
        
        try {
            autoGeneratePromptBtn.disabled = true;
            
            const content = script || material;
            const model = 'gemini-2.0-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const prompt = `根據以下內容，為Podcast節目生成一個適合的封面圖片描述提示詞，要求：
1. 必須用繁體中文撰寫提示詞
2. 描述具體的視覺元素（麥克風、耳機、錄音室等）
3. 風格要現代、專業、簡潔
4. 適合作為Podcast封面
5. 重要：不要在圖片中包含任何文字、字母或文字元素
6. 可以包含象徵性的圖案、符號但避免文字
7. 只回傳繁體中文提示詞，不要其他說明

請在提示詞中明確加入 "no text, no letters, no words" 等指示

內容：
${content.substring(0, 1000)}`;

            const requestBody = {
                "contents": [{
                    "parts": [{ "text": prompt }]
                }]
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`生成提示詞失敗: ${response.statusText}`);
            }

            const data = await response.json();
            const generatedPrompt = data.candidates[0].content.parts[0].text.trim();
            
            coverPrompt.value = generatedPrompt;
            showAlert('success', '✅ 提示詞自動生成完成！');
            
        } catch (error) {
            console.error('Error generating prompt:', error);
            showAlert('error', `❌ 生成提示詞失敗: ${error.message}`);
        } finally {
            autoGeneratePromptBtn.disabled = false;
        }
    }

    async function handleGenerateCover() {
        const apiKey = apiKeyInput.value.trim();
        const prompt = coverPrompt.value.trim();
        
        if (!apiKey) {
            showAlert('error', '❌ 請輸入您的 Gemini API 金鑰');
            return;
        }
        
        if (!prompt) {
            showAlert('error', '❌ 請輸入圖片提示詞或點擊自動生成');
            return;
        }

        try {
            generateCoverBtn.disabled = true;
            const spinner = document.getElementById('cover-spinner');
            spinner.classList.remove('hidden');
            
            let imageData = null;
            
            // Check if user uploaded an image
            const uploadedFile = coverImageUpload.files[0];
            if (uploadedFile) {
                imageData = {
                    mimeType: uploadedFile.type,
                    data: await fileToBase64(uploadedFile)
                };
            }
            
            const success = await generateCoverWithRetry(apiKey, prompt, imageData);
            
            if (!success) {
                showAlert('error', '❌ 封面圖片生成失敗，請重試');
            }
            
        } catch (error) {
            console.error('Error generating cover:', error);
            showAlert('error', `❌ 生成封面圖片失敗: ${error.message}`);
        } finally {
            generateCoverBtn.disabled = false;
            const spinner = document.getElementById('cover-spinner');
            spinner.classList.add('hidden');
        }
    }

    async function generateCoverWithRetry(apiKey, prompt, imageData, maxRetries = 3) {
        // 在提示詞中加入避免文字的指示
        const enhancedPrompt = `${prompt}, no text, no letters, no words, no chinese characters, text-free image`;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt === 1) {
                    showAlert('info', '🎨 正在生成封面圖片...');
                }
                
                const model = 'gemini-2.0-flash-preview-image-generation';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                
                let requestBody = {
                    "contents": [{
                        "parts": []
                    }],
                    "generationConfig": {
                        "responseModalities": ["TEXT", "IMAGE"]
                    }
                };

                // 添加增強的文字提示
                if (enhancedPrompt) {
                    requestBody.contents[0].parts.push({
                        "text": enhancedPrompt
                    });
                }

                // 如果有上傳的圖片，添加到請求中
                if (imageData) {
                    requestBody.contents[0].parts.push({
                        "inline_data": {
                            "mime_type": imageData.mimeType,
                            "data": imageData.data
                        }
                    });
                }
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API 錯誤: ${errorData.error?.message || response.statusText}`);
                }
                
                const data = await response.json();
                
                // 尋找圖片資料
                if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
                    for (const part of data.candidates[0].content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            // Display the generated image
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                            generatedImage.src = imageUrl;
                            generatedImageArea.classList.remove('hidden');
                            
                            // Setup download
                            const blob = base64ToBlob(part.inlineData.data, mimeType);
                            const downloadUrl = URL.createObjectURL(blob);
                            downloadCoverBtn.onclick = () => {
                                const a = document.createElement('a');
                                a.href = downloadUrl;
                                a.download = 'podcast-cover.png';
                                a.click();
                            };
                            
                            showAlert('success', '✅ 封面圖片生成成功！');
                            return true;
                        }
                    }
                }
                
                // 如果沒有找到圖片資料，進行靜默重試
                if (attempt < maxRetries) {
                    console.log(`Attempt ${attempt} failed: No image generated, retrying silently...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                } else {
                    throw new Error('圖片生成失敗，請檢查提示詞或稍後重試');
                }
                
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                console.log(`Attempt ${attempt} failed: ${error.message}, retrying silently...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        return false;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Initial setup
    speechTypeRadios.forEach(radio => radio.addEventListener('change', updateVoiceSelectionUI));
    generateBtn.addEventListener('click', handleGenerateScriptWithOverlay);
    generateAudioBtn.addEventListener('click', handleGenerateAudioWithOverlay);
    
    // Cover generation event listeners
    autoGeneratePromptBtn.addEventListener('click', handleAutoGeneratePrompt);
    generateCoverBtn.addEventListener('click', handleGenerateCover);
    
    // Enhanced script length handling
    scriptLengthInput.addEventListener('input', updateScriptLengthDisplay);

    // Initial word count update and event listener
    updateWordCount();
    scriptOutput.addEventListener('input', updateWordCount);
    
    // Setup enhanced features
    setupAutoSave();
    updateVoiceSelectionUI();
    updateScriptLengthDisplay();
});
