# 語音演講稿產製 Web App

## 專案目標

本專案旨在開發一個網頁應用程式和一個 Chrome 擴充功能，使用者可以輸入素材內容，透過 Google Gemini API 自動生成單人或雙人的演講稿，並將其轉換為語音檔，提供線上播放與下載功能。同時，也提供基於講稿內容的封面圖片生成功能。

## 使用技術

- **演講稿生成**: `gemini-3-flash-preview`
- **語音合成**: `gemini-3.1-flash-tts-preview`

## 功能模組

### 1. 素材輸入介面
- 提供直觀的文字輸入框，方便使用者鍵入或貼上素材內容。這些功能適用於 Web App 和 Chrome 擴充功能。
- **多元素材來源**: 
  - `Google 搜尋 (Gemini)`: 利用 Gemini API 進行 Google 搜尋並整合結果。
  - `網址擷取`: 智慧提取網頁內容，直接作為講稿素材。
  - `關鍵字搜尋 (Tavily)`: 透過關鍵字進行深度搜尋，獲取相關網路資訊。
  - `讀取 PDF`: 從 PDF 檔案中提取文字內容並加入素材。
- 支援輸入文字內容的最大限制（如需可設定）。

### 2. 設定區
- **演講形式選擇**: 
  - `單人演講`: 生成單一講者的演講稿。
  - `雙人對話`: 生成兩人對話形式的腳本。
- **語音選擇**: 
  - 根據演講形式（單人/雙人），提供多種預設語音供選擇，例如：Zephyr, Puck, Kore 等。

### 3. 演講稿生成
- 應用程式會利用 `gemini-3-flash-preview` 模型將輸入的素材轉換為結構化的演講腳本。
- **單人格式**: 輸出符合文字轉語音（TTS）單一講者規範的演講稿。
- **雙人格式**: 輸出符合對話腳本格式的內容。
- 提示語（Prompt）的組裝可由前端處理或透過後端控制。

### 4. 語音合成與回傳
- 使用 `gemini-3.1-flash-tts-preview` 模型進行語音合成，將生成的演講稿轉換為高品質語音檔。
- **單人語音範例**:
  ```json
  "contents": [{
    "parts": [{
      "text": "Say cheerfully: Have a wonderful day!"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {
      "voiceConfig": {
        "prebuiltVoiceConfig": {
          "voiceName": "Kore"
        }
      }
    }
  }
  ```
- **雙人語音範例**:
  ```json
  "contents": [{
    "parts": [{
      "text": "TTS the following conversation between Kore and Puck: \nKore: How\'s it going today Jane?\nPuck: Not too bad, how about you?"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["AUDIO"],
    "speechConfig": {
      "multiSpeakerVoiceConfig": {
        "speakerVoiceConfigs": [{
          "speaker": "Kore",
          "voiceConfig": {
            "prebuiltVoiceConfig": {
              "voiceName": "Kore"
            }
          }
        }, {
          "speaker": "Puck",
          "voiceConfig": {
            "prebuiltVoiceConfig": {
              "voiceName": "Puck"
            }
          }
        }]
      }
    }
  }
  ```

### 5. 音檔播放與下載
- 成功生成語音檔後，應用程式會提供：
  - **線上播放按鈕**: 方便使用者即時試聽生成的語音。
  - **音檔下載連結**: WAV音訊格式，方便使用者將語音檔儲存至本地。

### 6. 封面圖片生成 (Gemini)
- 根據講稿內容或素材自動生成圖片提示詞。
- 支援上傳參考圖片進行圖片編輯。
- 利用 Gemini API 生成專業的 Podcast 封面圖片。
- 提供封面圖片預覽與下載功能。

## 安裝與執行

### Web App
1. **複製專案**:
   ```bash
   git clone <專案的 Git 儲存庫 URL>
   cd PodcastGenerator
   ```

2. **安裝依賴**:
   本專案主要使用前端技術（HTML, CSS, JavaScript）以及對 Google Gemini API 的呼叫。運行此應用程式不需要額外的本地伺服器或特定語言的依賴。請確保您的開發環境已具備必要的網頁開發環境（例如現代瀏覽器）。

3. **設定 Google Gemini API 金鑰**:
   - 您需要自行處理 Google Gemini API 的認證與金鑰管理。
   - 請將您的 API 金鑰妥善配置在應用程式中（建議使用環境變數或安全的配置方式，避免直接硬編碼）。

4. **運行應用程式**:
   - 只需在瀏覽器中開啟 `index.html` 檔案即可運行本應用程式。

### Chrome 擴充功能
1. **下載整個 Extension 資料夾**
2. **開啟 Chrome 瀏覽器**
3. **進入 `chrome://extensions/`**
4. **開啟「開發者模式」**
5. **點擊「載入未封裝項目」**
6. **選擇 Extension 資料夾**

## 備註

- 本專案需自行處理 Google Gemini API 的認證與金鑰管理。
- 若 API 回傳的是 Base64 格式的語音數據，前端需負責將其轉換為可播放的音訊格式。 