// main.js

let wordDatabase = [];
let currentResults = []; // 現在画面に出ている結果を保持

// 1. データの読み込み (前回と同じ)
async function loadDictionary() {
    const statusEl = document.getElementById('dataStatus');
    try {
        const response = await fetch('words.json');
        wordDatabase = await response.json();
        statusEl.innerText = `${wordDatabase.length.toLocaleString()} 語 読み込み完了`;
    } catch (error) {
        statusEl.innerText = "読み込み失敗";
    }
}

// 2. 基本検索
function executeSearch() {
    const length = parseInt(document.getElementById('wordLength').value);
    const position = parseInt(document.getElementById('charPos').value);
    const char = document.getElementById('targetChar').value.trim();

    if (!char) return alert("文字を入力してください");

    currentResults = wordDatabase.filter(word => 
        word.length === length && word.charAt(position - 1) === char
    );
    displayResults();
}

// 3. 正規表現検索 (新規追加)
function executeRegexSearch() {
    const pattern = document.getElementById('regexInput').value;
    try {
        const re = new RegExp(pattern);
        currentResults = wordDatabase.filter(word => re.test(word));
        displayResults();
    } catch (e) {
        alert("正規表現が正しくありません");
    }
}

// 4. 結果表示用 (共通化)
function displayResults() {
    const resultsContainer = document.getElementById('results');
    const countEl = document.getElementById('matchCount');
    countEl.innerText = ` | ヒット数: ${currentResults.length} 件`;
    
    const displayLimit = 500;
    const displayItems = currentResults.slice(0, displayLimit);

    resultsContainer.innerHTML = displayItems
        .map(word => `<div class="word-item">${word}</div>`)
        .join('');

    if (currentResults.length > displayLimit) {
        resultsContainer.innerHTML += `<div class="info">他 ${currentResults.length - displayLimit} 件は省略されました</div>`;
    }
}

// 5. Gemini用プロンプト生成 (新規追加)
function generateGeminiPrompt() {
    const instruction = document.getElementById('geminiInstruction').value || "条件に合うものだけ抽出して";
    const outputArea = document.getElementById('geminiOutput');
    const copyBtn = document.getElementById('copyBtn');

    if (currentResults.length === 0) {
        alert("先に単語を検索してリストを作成してください。");
        return;
    }

    // あまりに長いとAIが処理しきれないので最大200件程度に制限
    const listText = currentResults.slice(0, 200).join(', ');
    
    const prompt = `以下の単語リストの中から、「${instruction}」に該当するものだけを抽出して箇条書きで教えてください。\n\nリスト：\n${listText}`;
    
    outputArea.value = prompt;
    copyBtn.style.display = 'block';
}

// 6. コピー機能
function copyPrompt() {
    const outputArea = document.getElementById('geminiOutput');
    outputArea.select();
    document.execCommand('copy');
    alert("プロンプトをクリップボードにコピーしました。Geminiに貼り付けてください。");
}

loadDictionary();