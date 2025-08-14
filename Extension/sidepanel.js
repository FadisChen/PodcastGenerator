// Side panel JavaScript for Podcast Generator extension
const gasUrl = "https://script.google.com/macros/s/AKfycbwGvSAohbPly-hmIMNGfXNDCq-ifDP94k0TUfXEGWBvmLeojlpm5IkAJU0O2uZXeXVo/exec";

class PodcastGenerator {
    constructor() {
        this.voices = [
            "Achernar(女)", "Achird(男)", "Aoede(女)", "Algieba(男)", "Algenib(男)", "Alnilam(男)", "Autonoe(女)",
            "Callirrhoe(女)", "Charon(男)", "Despina(女)", "Enceladus(男)", "Erinome(女)", "Fenrir(男)", "Gacrux(女)",
            "Iapetus(男)", "Kore(女)", "Laomedeia(女)", "Leda(女)", "Orus(男)", "Puck(男)", "Pulcherrima(女)", "Rasalgethi(男)",
            "Sadachbia(男)", "Sadaltager(男)", "Schedar(男)", "Sulafat(女)", "Umbriel(男)", "Vindemiatrix(女)",
            "Zephyr(女)", "Zubenelgenubi(男)"
        ];

        this.initializeElements();
        this.setupEventListeners();
        this.loadApiKey();
        this.updateVoiceSelectionUI();
        this.pollForElementSelection();
    }

    initializeElements() {
        // API Key elements
        this.apiKeyStatus = document.getElementById('api-key-status');
        this.changeApiKeyBtn = document.getElementById('change-api-key');
        this.apiStatusText = document.getElementById('api-status-text');

        // Material elements
        this.materialInput = document.getElementById('material');
        this.extractElementBtn = document.getElementById('extract-element-btn');
        this.googleSearchBtn = document.getElementById('google-search-btn');
        this.tavilySearchBtn = document.getElementById('tavily-search-btn');

        // Voice elements
        this.speechTypeRadios = document.querySelectorAll('input[name="speechType"]');
        this.voiceSelection = document.getElementById('voice-selection');

        // Style elements
        this.stylePrompt = document.getElementById('style-prompt');

        // Script elements
        this.generateScriptBtn = document.getElementById('generate-script-btn');
        this.scriptContent = document.getElementById('script-content');
        this.wordCount = document.getElementById('word-count');
        
        // Script enhancement elements
        this.scriptEnhancementSection = document.getElementById('script-enhancement-section');
        this.enhanceDepthBtn = document.getElementById('enhance-depth-btn');
        this.enhanceSimplifyBtn = document.getElementById('enhance-simplify-btn');
        this.enhanceToneBtn = document.getElementById('enhance-tone-btn');
        this.enhanceQualityBtn = document.getElementById('enhance-quality-btn');
        this.enhanceStructureBtn = document.getElementById('enhance-structure-btn');
        this.enhanceEngagementBtn = document.getElementById('enhance-engagement-btn');

        // Audio elements
        this.generateAudioBtn = document.getElementById('generate-audio-btn');
        this.audioSection = document.getElementById('audio-section');
        this.audioPlayer = document.getElementById('audio-player');
        this.downloadAudioBtn = document.getElementById('download-audio-btn');

        // Image generation elements
        this.imagePrompt = document.getElementById('image-prompt');
        this.autoGeneratePromptBtn = document.getElementById('auto-generate-prompt-btn');
        this.generateImageBtn = document.getElementById('generate-image-btn');
        this.generatedImageArea = document.getElementById('generated-image-area');
        this.generatedImage = document.getElementById('generated-image');
        this.downloadImageBtn = document.getElementById('download-image-btn');

        // Modal elements
        this.googleModal = document.getElementById('google-modal');
        this.tavilyModal = document.getElementById('tavily-modal');
        this.alertModal = document.getElementById('alert-modal');
        this.alertContent = document.getElementById('alert-content');
    }

    setupEventListeners() {
        // API Key events
        this.changeApiKeyBtn.addEventListener('click', () => this.promptForApiKey());

        // Material extraction events
        this.extractElementBtn.addEventListener('click', () => this.startElementSelection());
        this.googleSearchBtn.addEventListener('click', () => this.showModal('google-modal'));
        this.tavilySearchBtn.addEventListener('click', () => this.showModal('tavily-modal'));

        // Voice selection events
        this.speechTypeRadios.forEach(radio =>
            radio.addEventListener('change', () => this.updateVoiceSelectionUI())
        );

        // Script events
        this.generateScriptBtn.addEventListener('click', () => this.generateScript());
        this.scriptContent.addEventListener('input', () => this.updateWordCount());
        
        // Script enhancement events
        this.enhanceDepthBtn.addEventListener('click', () => this.enhanceScript('depth'));
        this.enhanceSimplifyBtn.addEventListener('click', () => this.enhanceScript('simplify'));
        this.enhanceToneBtn.addEventListener('click', () => this.enhanceScript('tone'));
        this.enhanceQualityBtn.addEventListener('click', () => this.enhanceScript('quality'));
        this.enhanceStructureBtn.addEventListener('click', () => this.enhanceScript('structure'));
        this.enhanceEngagementBtn.addEventListener('click', () => this.enhanceScript('engagement'));

        // Audio events
        this.generateAudioBtn.addEventListener('click', () => this.generateAudio());

        // Image generation events
        this.autoGeneratePromptBtn.addEventListener('click', () => this.autoGeneratePrompt());
        this.generateImageBtn.addEventListener('click', () => this.generateImage());

        // Modal events
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Google search modal
        document.getElementById('cancel-google').addEventListener('click', () => this.hideModal('google-modal'));
        document.getElementById('confirm-google').addEventListener('click', () => this.performGoogleSearch());

        // Tavily search modal
        document.getElementById('cancel-tavily').addEventListener('click', () => this.hideModal('tavily-modal'));
        document.getElementById('confirm-tavily').addEventListener('click', () => this.performTavilySearch());

        // Enter key support
        document.getElementById('google-query').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.performGoogleSearch();
            }
        });

        document.getElementById('tavily-query').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performTavilySearch();
            }
        });
    }

    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                this.currentApiKey = result.geminiApiKey;
                this.updateApiKeyStatus(true);
            } else {
                this.updateApiKeyStatus(false);
                // Prompt for API key if not set
                await this.promptForApiKey();
            }
        } catch (error) {
            this.showAlert('error', '❌ 載入 API 金鑰失敗: ' + error.message);
            this.updateApiKeyStatus(false);
        }
    }

    async promptForApiKey() {
        const apiKey = prompt('請輸入您的 Gemini API 金鑰：');
        if (apiKey && apiKey.trim()) {
            try {
                await chrome.storage.local.set({ geminiApiKey: apiKey.trim() });
                this.currentApiKey = apiKey.trim();
                this.updateApiKeyStatus(true);
                this.showAlert('success', '✅ API 金鑰已設定');
            } catch (error) {
                this.showAlert('error', '❌ 儲存失敗: ' + error.message);
            }
        } else if (apiKey !== null) { // User didn't cancel but entered empty string
            this.showAlert('error', '❌ 請輸入有效的 API 金鑰');
        }
    }

    updateApiKeyStatus(hasKey) {
        if (hasKey) {
            this.apiStatusText.textContent = '✅ API 金鑰已設定';
            this.apiStatusText.className = 'status-text';
        } else {
            this.apiStatusText.textContent = '❌ 尚未設定 API 金鑰';
            this.apiStatusText.className = 'status-text error';
        }
    }

    updateVoiceSelectionUI() {
        const selectedType = document.querySelector('input[name="speechType"]:checked').value;
        this.voiceSelection.innerHTML = '';

        if (selectedType === 'solo') {
            this.voiceSelection.appendChild(this.createVoiceDropdown('voice1'));
        } else {
            this.voiceSelection.appendChild(this.createVoiceDropdown('voice1'));
            this.voiceSelection.appendChild(this.createVoiceDropdown('voice2'));
        }
    }

    createVoiceDropdown(id) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('voice-row');

        // Voice select
        const select = document.createElement('select');
        select.id = id;

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇語音...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        this.voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.split('(')[0].trim();
            option.textContent = voice;
            select.appendChild(option);
        });

        // Speaker name input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = id + '_name';
        nameInput.placeholder = '講者名稱';

        wrapper.appendChild(select);
        wrapper.appendChild(nameInput);

        return wrapper;
    }

    async startElementSelection() {
        try {
            this.extractElementBtn.disabled = true;
            this.extractElementBtn.textContent = '🎯 選取中...';

            // Send message to background script to start element selection
            await chrome.runtime.sendMessage({ action: 'startElementSelection' });

        } catch (error) {
            this.showAlert('error', '❌ 啟動元素選取失敗: ' + error.message);
            this.extractElementBtn.disabled = false;
            this.extractElementBtn.innerHTML = '🌐 網頁擷取';
        }
    }

    pollForElementSelection() {
        // Poll for element selection results
        setInterval(async () => {
            try {
                const result = await chrome.storage.local.get(['lastElementSelection']);
                if (result.lastElementSelection) {
                    const data = result.lastElementSelection;
                    const now = Date.now();

                    // Only process if this is a new selection (within last 5 seconds)
                    if (now - data.timestamp < 5000) {
                        if (data.action === 'elementSelected') {
                            this.handleElementSelected(data);
                        } else if (data.action === 'selectionCancelled') {
                            this.handleSelectionCancelled();
                        }

                        // Clear the stored data
                        await chrome.storage.local.remove(['lastElementSelection']);
                    }
                }
            } catch (error) {
                this.showAlert('error', '❌ 元素選取失敗: ' + error.message);
            }
        }, 1000);
    }

    handleElementSelected(data) {
        if (data.text) {
            const currentMaterial = this.materialInput.value;
            const separator = currentMaterial ? '\n\n--- 網頁擷取內容 ---\n' : '';
            this.materialInput.value = currentMaterial + separator + data.text;
            this.showAlert('success', '✅ 元素文字已擷取');
        } else {
            this.showAlert('error', '❌ 未能擷取到文字內容');
        }

        this.extractElementBtn.disabled = false;
        this.extractElementBtn.innerHTML = '🌐 網頁擷取';
    }

    handleSelectionCancelled() {
        this.extractElementBtn.disabled = false;
        this.extractElementBtn.innerHTML = '🌐 網頁擷取';
        this.showAlert('info', 'ℹ️ 元素選取已取消');
    }

    async performGoogleSearch() {
        const query = document.getElementById('google-query').value.trim();
        if (!query) {
            this.showAlert('error', '❌ 請輸入搜尋內容');
            return;
        }

        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }

        this.hideModal('google-modal');
        this.showAlert('info', '🔎 正在進行 Google 搜尋...', true);

        try {
            const response = await this.fetchGroundingData(this.currentApiKey, query);
            this.hideAlert();
            if (response) {
                const currentMaterial = this.materialInput.value;
                this.materialInput.value = currentMaterial + (currentMaterial ? '\n\n' : '') + response;
                this.showAlert('success', '✅ Google 搜尋完成！');
            } else {
                this.showAlert('error', '❌ 搜尋無結果');
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', '❌ Google 搜尋失敗: ' + error.message);
        } finally {
            document.getElementById('google-query').value = '';
        }
    }

    async performTavilySearch() {
        const query = document.getElementById('tavily-query').value.trim();
        const deepSearch = document.getElementById('deep-search').checked;

        if (!query) {
            this.showAlert('error', '❌ 請輸入搜尋關鍵字');
            return;
        }

        this.hideModal('tavily-modal');
        this.showAlert('info', '🔍 正在進行 Tavily 搜尋...', true);

        try {
            const response = await fetch(`${gasUrl}?q=${encodeURIComponent(query)}&deepSearch=${deepSearch}`);
            const data = await response.json();

            this.hideAlert();
            if (data.answer) {
                const currentMaterial = this.materialInput.value;
                let searchResults = data.answer;

                if (deepSearch && data.contents?.length > 0) {
                    const deepContents = data.contents
                        .filter(item => item.rawContent?.trim())
                        .map(item => `\n來源：${item.url}\n${item.rawContent}`)
                        .join('\n\n---\n\n');

                    if (deepContents) {
                        searchResults += `\n\n=== 詳細內容 ===\n${deepContents}`;
                    }
                }

                this.materialInput.value = currentMaterial + (currentMaterial ? '\n\n' : '') + searchResults;
                this.showAlert('success', '✅ Tavily 搜尋完成！');
            } else {
                this.showAlert('error', '❌ 搜尋無結果');
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', '❌ Tavily 搜尋失敗: ' + error.message);
        } finally {
            document.getElementById('tavily-query').value = '';
            document.getElementById('deep-search').checked = false;
        }
    }

    async fetchGroundingData(apiKey, query) {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody = {
            "contents": [{
                "parts": [{
                    "text": `"${query}"`
                }]
            }],
            "generationConfig": {
                    "thinkingConfig": {
                        "thinkingBudget": 0,
                    },
                },
            "tools": [{
                "googleSearch": {}
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Google Search Grounding 失敗');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async generateScript() {
        const material = this.materialInput.value.trim();
        const speechType = document.querySelector('input[name="speechType"]:checked').value;
        const stylePrompt = this.stylePrompt.value.trim() || 'Podcast節目，語調輕鬆自然，適合收聽';

        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }
        if (!material) {
            this.showAlert('error', '❌ 請輸入素材內容');
            return;
        }

        // Validate voice selection
        if (speechType === 'duo') {
            const voice1 = document.getElementById('voice1')?.value;
            const voice2 = document.getElementById('voice2')?.value;
            if (!voice1 || !voice2) {
                this.showAlert('error', '❌ 雙人模式請選擇兩個語音');
                return;
            }
            if (voice1 === voice2) {
                this.showAlert('error', '❌ 請選擇兩個不同的語音');
                return;
            }
        } else {
            const voice1 = document.getElementById('voice1')?.value;
            if (!voice1) {
                this.showAlert('error', '❌ 請選擇語音');
                return;
            }
        }

        this.generateScriptBtn.disabled = true;
        document.getElementById('script-spinner').classList.remove('hidden');
        this.scriptContent.value = '';

        try {
            await this.callGeminiForScriptStreaming(this.currentApiKey, material, speechType, stylePrompt);
            this.showAlert('success', '✅ 講稿生成完成！');
            this.showScriptEnhancementButtons();
        } catch (error) {
            this.showAlert('error', '❌ 生成講稿失敗: ' + error.message);
        } finally {
            this.generateScriptBtn.disabled = false;
            document.getElementById('script-spinner').classList.add('hidden');
        }
    }

    async callGeminiForScriptStreaming(apiKey, material, speechType, stylePrompt) {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

        let prompt;
        if (speechType === 'solo') {
            const voice1 = document.getElementById('voice1').value;
            const speaker1Name = document.getElementById('voice1_name')?.value || voice1;

            prompt = `請將以下素材轉換成一篇繁體中文單人講稿，風格要求：${stylePrompt}。講者名稱是「${speaker1Name}」。

要求：
- 語調和風格要符合 ${stylePrompt} 的特性
- 內容要流暢自然，適合語音播報
- 只需要演講內容，不要有標題或其他額外文字
- 皆使用台灣用語、台灣連接詞，可以適時使用台灣狀聲詞

素材：
${material}`;
        } else {
            const voice1 = document.getElementById('voice1').value;
            const voice2 = document.getElementById('voice2').value;
            const speaker1Name = document.getElementById('voice1_name')?.value || voice1;
            const speaker2Name = document.getElementById('voice2_name')?.value || voice2;

            prompt = `請將以下素材轉換成一段繁體中文雙人對話腳本，風格要求：${stylePrompt}。

兩位講者：
- 第一位：${speaker1Name}
- 第二位：${speaker2Name}

要求：
- 對話要自然流暢，符合 ${stylePrompt} 的特性
- 請用「${speaker1Name}:」和「${speaker2Name}:」的格式來區分對白
- 兩人要有互動和討論，不是各自獨白
- 只需要演講內容，不要有標題或其他額外文字
- 皆使用台灣用語、台灣連接詞，可以適時使用台灣狀聲詞

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
                "temperature": 0.8
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('API 請求失敗');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim() === '') continue;

                    if (line.startsWith('data: ')) {
                        const jsonStr = line.substring(6);
                        if (jsonStr.trim() === '[DONE]') continue;

                        try {
                            const data = JSON.parse(jsonStr);
                            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                                const newText = data.candidates[0].content.parts[0].text;
                                accumulatedText += newText;
                                this.scriptContent.value = accumulatedText;
                                this.updateWordCount();

                                // Auto-scroll to bottom
                                this.scriptContent.scrollTop = this.scriptContent.scrollHeight;
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse SSE data:', jsonStr);
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return accumulatedText;
    }

    async generateAudio() {
        const script = this.scriptContent.value.trim();
        const speechType = document.querySelector('input[name="speechType"]:checked').value;

        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }
        if (!script) {
            this.showAlert('error', '❌ 請先生成講稿');
            return;
        }

        this.generateAudioBtn.disabled = true;
        document.getElementById('audio-spinner').classList.remove('hidden');
        this.showAlert('info', '🔊 正在生成音檔...', true);

        try {
            const audioBase64 = await this.generateSpeech(this.currentApiKey, script, speechType);
            this.hideAlert();
            if (audioBase64) {
                this.displayAudio(audioBase64);
                this.showAlert('success', '✅ 音檔生成完成！');
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', '❌ 生成音檔失敗: ' + error.message);
        } finally {
            this.generateAudioBtn.disabled = false;
            document.getElementById('audio-spinner').classList.add('hidden');
        }
    }

    async generateSpeech(apiKey, script, speechType) {
        // Check if script is too long and needs segmentation
        if (script.length > 4000) {
            return await this.generateSegmentedSpeech(apiKey, script, speechType);
        }

        return await this.generateSingleSegment(apiKey, script, speechType);
    }

    async generateSegmentedSpeech(apiKey, script, speechType) {
        const segments = this.splitScriptIntoSegments(script, speechType);
        const audioSegments = [];

        this.hideAlert();
        this.showAlert('info', `📝 檢測到較長內容，將自動分段生成音檔 (共 ${segments.length} 段)...`, true);

        for (let i = 0; i < segments.length; i++) {
            let retryCount = 0;
            const maxRetries = 2;

            while (retryCount <= maxRetries) {
                try {
                    this.showAlert('info', `📝 正在生成第 ${i + 1}/${segments.length} 段音檔${retryCount > 0 ? ` (重試 ${retryCount})` : ''}...`, true);
                    const segmentAudioBase64 = await this.generateSingleSegment(apiKey, segments[i], speechType);
                    if (segmentAudioBase64) {
                        const pcmBytes = this.base64ToUint8Array(segmentAudioBase64);
                        audioSegments.push(pcmBytes);
                        break; // Success, exit retry loop
                    } else {
                        throw new Error('音檔生成返回空結果');
                    }
                } catch (error) {
                    // Check if it's a 429 error (rate limit)
                    if (error.message.includes('429')) {
                        this.hideAlert();
                        this.showAlert('error', '❌ API 用量已達上限，請稍後再試或更換 API 金鑰');
                        throw new Error('API 用量限制');
                    }

                    retryCount++;

                    if (retryCount <= maxRetries) {
                        this.showAlert('info', `第 ${i + 1} 段生成失敗，正在重試 ${retryCount}/${maxRetries}...`, true);
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    } else {
                        this.showAlert('error', `❌ 第 ${i + 1} 段最終失敗，跳過此段落`);
                        // Continue with next segment even if this one fails
                        break;
                    }
                }
            }
        }

        if (audioSegments.length === 0) {
            throw new Error('所有音檔段落生成失敗');
        }

        this.showAlert('info', '🔗 正在合併音檔片段...', true);

        // Merge all audio segments
        const mergedAudio = this.mergeAudioSegments(audioSegments);
        return this.uint8ArrayToBase64(mergedAudio);
    }

    splitScriptIntoSegments(script, speechType) {
        const maxLength = 4000;
        const segments = [];

        if (speechType === 'solo') {
            // Split by sentences for solo speech
            const sentences = script.split(/[。！？]/).filter(s => s.trim());
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
            // Split by dialogue lines for duo speech
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

    async generateSingleSegment(apiKey, segmentScript, speechType) {
        const model = 'gemini-2.5-flash-preview-tts';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        let requestBody;
        if (speechType === 'solo') {
            const voice1 = document.getElementById('voice1').value;
            const stylePrompt = this.stylePrompt.value.trim() || 'Podcast風格';

            requestBody = {
                "contents": [{
                    "parts": [{
                        "text": `請以${stylePrompt}的語氣讀出以下講稿：${segmentScript}`
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
            const stylePrompt = this.stylePrompt.value.trim() || 'Podcast風格';

            const ttsPrompt = `請以${stylePrompt}的語氣生成以下對話的語音：\n${segmentScript}`;

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
            const errorText = await response.text();
            throw new Error(`語音合成失敗 (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
            return data.candidates[0].content.parts[0].inlineData.data;
        } else if (data.error) {
            throw new Error(`API錯誤: ${data.error.message}`);
        } else {
            console.log('Unexpected response format:', data);
            throw new Error('回應格式錯誤：找不到音檔內容');
        }
    }

    displayAudio(audioBase64) {
        const pcmBytes = this.base64ToUint8Array(audioBase64);
        const audioBlob = this.createWavBlob(pcmBytes);
        const audioUrl = URL.createObjectURL(audioBlob);

        this.audioPlayer.src = audioUrl;
        this.audioSection.classList.remove('hidden');

        // 生成帶日期時間的檔名
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const fileName = `podcast_${year}${month}${day}_${hours}${minutes}${seconds}.wav`;

        // 設置下載點擊事件
        this.downloadAudioBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = fileName;
            a.click();
        };
    }

    base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    uint8ArrayToBase64(uint8Array) {
        let binary = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    mergeAudioSegments(segments) {
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

    createWavBlob(pcmBytes) {
        const sampleRate = 24000;
        const numChannels = 1;
        const bitsPerSample = 16;

        // 確保 PCM 數據長度是偶數（16位音訊）
        let actualPcmData = pcmBytes;
        if (pcmBytes.length % 2 !== 0) {
            actualPcmData = new Uint8Array(pcmBytes.length + 1);
            actualPcmData.set(pcmBytes);
            actualPcmData[pcmBytes.length] = 0;
        }

        const blockAlign = numChannels * bitsPerSample / 8;
        const byteRate = sampleRate * blockAlign;

        const headerSize = 44;
        const buffer = new ArrayBuffer(headerSize + actualPcmData.length);
        const view = new DataView(buffer);

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        // WAV header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + actualPcmData.length, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, actualPcmData.length, true);

        const pcmData = new Uint8Array(buffer, headerSize);
        pcmData.set(actualPcmData);

        return new Blob([buffer], { type: 'audio/wav' });
    }

    updateWordCount() {
        const text = this.scriptContent.value.trim();
        this.wordCount.textContent = `字數: ${text.length}`;
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    showAlert(type, message, persistent = false) {
        // Apply type-specific styling
        this.alertContent.className = `alert-content alert-${type}`;
        this.alertContent.innerHTML = `<p>${message}</p>`;

        this.alertModal.classList.remove('hidden');

        // Only auto-hide if not persistent
        if (!persistent) {
            setTimeout(() => {
                this.alertModal.classList.add('hidden');
            }, 3000);
        }
    }

    hideAlert() {
        this.alertModal.classList.add('hidden');
    }

    async autoGeneratePrompt() {
        const material = this.materialInput.value.trim();
        const script = this.scriptContent.value.trim();

        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }

        if (!material && !script) {
            this.showAlert('error', '❌ 請先輸入素材或生成講稿');
            return;
        }

        this.autoGeneratePromptBtn.disabled = true;
        this.showAlert('info', '🤖 正在自動生成圖片提示詞...', true);

        try {
            const content = script || material;
            const prompt = `根據以下內容，生成一個適合做 Podcast 封面的圖片提示詞。要求：
            1. 描述要簡潔明確，適合圖像生成
            2. 風格要現代、專業、吸引人
            3. 避免包含文字元素
            4. 用英文描述

            內容：
            ${content.substring(0, 1000)}...`;

            const model = 'gemini-2.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.currentApiKey}`;

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
                throw new Error('API 請求失敗');
            }

            const data = await response.json();
            this.hideAlert();

            if (response) {
                this.imagePrompt.value = data.candidates[0].content.parts[0].text.trim();
                this.showAlert('success', '✅ 圖片提示詞生成完成！');
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', '❌ 生成提示詞失敗: ' + error.message);
        } finally {
            this.autoGeneratePromptBtn.disabled = false;
        }
    }

    async generateImage() {
        const prompt = this.imagePrompt.value.trim();

        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }

        if (!prompt) {
            this.showAlert('error', '❌ 請輸入圖片提示詞或點擊自動生成');
            return;
        }

        this.generateImageBtn.disabled = true;
        document.getElementById('image-spinner').classList.remove('hidden');
        this.showAlert('info', '🎨 正在生成封面圖片...', true);

        try {
            const success = await this.generateImageWithRetry(this.currentApiKey, prompt);

            if (!success) {
                this.showAlert('error', '❌ 封面圖片生成失敗，請重試');
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', '❌ 生成封面圖片失敗: ' + error.message);
        } finally {
            this.generateImageBtn.disabled = false;
            document.getElementById('image-spinner').classList.add('hidden');
        }
    }

    async generateImageWithRetry(apiKey, prompt, maxRetries = 3) {
        // Add instructions to avoid text in the image
        const enhancedPrompt = `${prompt}, no text, no letters, no words, no chinese characters, text-free image`;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                if (attempt > 1) {
                    this.showAlert('info', `🎨 重試生成圖片 (${attempt}/${maxRetries})...`, true);
                }

                const model = 'gemini-2.0-flash-preview-image-generation';
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const requestBody = {
                    "contents": [{
                        "parts": [{
                            "text": enhancedPrompt
                        }]
                    }],
                    "generationConfig": {
                        "responseModalities": ["TEXT", "IMAGE"]
                    }
                };

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

                // Look for image data
                if (data.candidates?.[0]?.content?.parts) {
                    for (const part of data.candidates[0].content.parts) {
                        if (part.inlineData?.data) {
                            // Display the generated image
                            const mimeType = part.inlineData.mimeType || 'image/png';
                            const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
                            this.generatedImage.src = imageUrl;
                            this.generatedImageArea.classList.remove('hidden');

                            // Setup download
                            const blob = this.base64ToBlob(part.inlineData.data, mimeType);
                            const downloadUrl = URL.createObjectURL(blob);
                            
                            // 生成帶日期時間的圖片檔名
                            const now = new Date();
                            const year = now.getFullYear();
                            const month = String(now.getMonth() + 1).padStart(2, '0');
                            const day = String(now.getDate()).padStart(2, '0');
                            const hours = String(now.getHours()).padStart(2, '0');
                            const minutes = String(now.getMinutes()).padStart(2, '0');
                            const seconds = String(now.getSeconds()).padStart(2, '0');
                            const imageFileName = `podcast-cover_${year}${month}${day}_${hours}${minutes}${seconds}.png`;
                            
                            this.downloadImageBtn.onclick = () => {
                                const a = document.createElement('a');
                                a.href = downloadUrl;
                                a.download = imageFileName;
                                a.click();
                            };

                            this.hideAlert();
                            this.showAlert('success', '✅ 封面圖片生成成功！');
                            return true;
                        }
                    }
                }

                throw new Error('未找到生成的圖片數據');

            } catch (error) {
                this.showAlert('error', `❌ 圖片生成嘗試 ${attempt} 失敗: ${error.message}`);

                if (attempt === maxRetries) {
                    throw error;
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return false;
    }

    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    showScriptEnhancementButtons() {
        if (this.scriptContent.value.trim()) {
            this.scriptEnhancementSection.classList.remove('hidden');
        }
    }

    hideScriptEnhancementButtons() {
        this.scriptEnhancementSection.classList.add('hidden');
    }

    async enhanceScript(enhancementType) {
        const currentScript = this.scriptContent.value.trim();
        
        if (!this.currentApiKey) {
            this.showAlert('error', '❌ 請先設定 API 金鑰');
            return;
        }

        if (!currentScript) {
            this.showAlert('error', '❌ 請先生成講稿');
            return;
        }

        // Disable the specific enhancement button
        const buttonId = `enhance-${enhancementType}-btn`;
        const button = document.getElementById(buttonId);
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '⏳ 處理中...';

        this.showAlert('info', `🔄 正在${this.getEnhancementDescription(enhancementType)}...`, true);

        try {
            const enhancedScript = await this.callGeminiForScriptEnhancement(
                this.currentApiKey, 
                currentScript, 
                enhancementType
            );
            
            this.hideAlert();
            if (enhancedScript) {
                this.scriptContent.value = enhancedScript;
                this.updateWordCount();
                this.showAlert('success', `✅ ${this.getEnhancementDescription(enhancementType)}完成！`);
            }
        } catch (error) {
            this.hideAlert();
            this.showAlert('error', `❌ ${this.getEnhancementDescription(enhancementType)}失敗: ${error.message}`);
        } finally {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    }

    getEnhancementDescription(type) {
        const descriptions = {
            'depth': '增加內容深度',
            'simplify': '精簡內容',
            'tone': '調整語調',
            'quality': '提升質量',
            'structure': '優化結構',
            'engagement': '增強吸引力'
        };
        return descriptions[type] || '強化講稿';
    }

    async callGeminiForScriptEnhancement(apiKey, currentScript, enhancementType) {
        const model = 'gemini-2.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const speechType = document.querySelector('input[name="speechType"]:checked').value;
        const stylePrompt = this.stylePrompt.value.trim() || 'Podcast節目，語調輕鬆自然，適合收聽';

        let enhancementPrompt = this.getEnhancementPrompt(enhancementType, speechType, stylePrompt);
        
        const prompt = `${enhancementPrompt}

原始講稿：
${currentScript}

請根據以上要求重寫講稿，保持：
- 原有的風格：${stylePrompt}
- 講稿格式：${speechType === 'duo' ? '雙人對話格式（講者名稱: 內容）' : '單人演講格式'}
- 使用繁體中文
- 台灣用語和連接詞

請直接輸出重寫後的講稿內容，不要有額外說明。`;

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
            throw new Error('API 請求失敗');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    }

    getEnhancementPrompt(type, speechType, stylePrompt) {
        const prompts = {
            'depth': `請將以下講稿增加更多深度和細節：
- 添加更多具體例子和案例
- 深入解釋關鍵概念
- 提供更多背景資訊
- 增加數據和事實支撐`,

            'simplify': `請將以下講稿精簡化：
- 保留最重要的核心訊息
- 去除冗餘和重複內容
- 使用更簡潔的表達方式
- 突出重點，減少細節`,

            'tone': `請調整以下講稿的語調，使其更加生動有趣：
- 使用更活潑、親近的語言
- 增加適當的情感表達
- 加入一些輕鬆的元素
- 讓語調更符合現代Podcast風格`,

            'quality': `請提升以下講稿的整體質量和專業度：
- 改善語言的流暢性和邏輯性
- 使用更準確和專業的詞彙
- 完善論述結構和連接
- 提高內容的說服力`,

            'structure': `請重新組織以下講稿的結構：
- 優化內容的邏輯順序
- 添加清晰的段落過渡
- 改善整體的條理性
- 讓內容更易理解和跟隨`,

            'engagement': `請增強以下講稿的互動性和吸引力：
- 添加引人入勝的開場
- 增加問題和思考點
- 使用更吸引人的表達方式
- 讓聽眾更容易產生共鳴`
        };

        return prompts[type] || '請優化以下講稿';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PodcastGenerator();
}); 