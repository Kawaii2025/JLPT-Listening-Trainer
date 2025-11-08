// 导入其他模块
import { containsJapanese, splitByPeriod, extractAndRemoveGenderPrefix, findNextParticlePosition, findNthParticlePosition, compareTexts } from './utils.js';
import { speakJapanese, initSpeechSynthesis } from './speech.js';
import uiFunctions from './ui.js';

// 从导入的对象中解构需要的函数
const { updateComparisonResult, renderAllSentenceCards, updateEmptyState, showNotification } = uiFunctions;

// 句子数据存储
export let sentenceData = [];
export let chineseSentences = [];

// DOM元素
export let mixedTextarea;
let processBtn;
let clearBtn;
let resultsSection;
let emptyState;
let sentencesContainer;
let sentenceCountElement;
export let editModal;
let closeEditModalBtn;
let cancelEditBtn;
let saveEditBtn;
let editSentenceIndex;
let editGender;
let editJapanese;
let editChinese;

// 初始化应用
function initApp() {
    // 获取DOM元素
    mixedTextarea = document.getElementById('mixed-text');
    processBtn = document.getElementById('process-button');
    clearBtn = document.getElementById('clear-button');
    resultsSection = document.getElementById('results-section');
    emptyState = document.getElementById('empty-state');
    sentencesContainer = document.getElementById('sentences-container');
    sentenceCountElement = document.getElementById('sentence-count');
    editModal = document.getElementById('edit-modal');
    closeEditModalBtn = document.getElementById('close-modal');
    cancelEditBtn = document.getElementById('cancel-edit');
    saveEditBtn = document.getElementById('save-edit');
    editSentenceIndex = document.getElementById('edit-sentence-index');
    editGender = document.getElementById('edit-gender');
    editJapanese = document.getElementById('edit-japanese');
    editChinese = document.getElementById('edit-chinese');
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化语音合成
    initSpeechSynthesis();
    
    // 更新空状态
    updateEmptyState();
    
    // 预填充示例文本
    mixedTextarea.value = `電話で女の学生と男の学生が話しています。男の学生は明日何をしなければなりませんか。
在电话里女学生和男学生正在交谈。男学生明天必须做什么？
女：もしもし、伊藤君、私田中だけど。明日のサークルのミーティングが急用で出られなくなっちゃったから代わりに仕切ってくれない？
女：喂，伊藤君，我是田中。明天社团的会议因为有急事我去不了了，你能代替我主持吗？
男：はい、わかりました。何か特別に準備することはありますか？
男：好的，我知道了。有什么需要特别准备的吗？
女：資料は事前にメールで送っておきますから、それを印刷して持ってきてくれると助かります。
女：资料我会提前用邮件发过去，如果你能打印出来带过去就太好了。`;
}

// 绑定事件监听器
function bindEventListeners() {
    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            navbar.classList.add('py-2', 'shadow');
            navbar.classList.remove('py-4', 'shadow-sm');
        } else {
            navbar.classList.add('py-4', 'shadow-sm');
            navbar.classList.remove('py-2', 'shadow');
        }
    });
    
    // 移动端菜单切换
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // 处理按钮点击事件
    processBtn.addEventListener('click', processText);
    
    // 清空按钮点击事件
    clearBtn.addEventListener('click', function() {
        mixedTextarea.value = '';
        resultsSection.classList.add('hidden');
        sentenceData = [];
        chineseSentences = [];
        updateEmptyState();
        mixedTextarea.focus();
    });
    
    // 关闭编辑模态框
    closeEditModalBtn.addEventListener('click', function() {
        editModal.classList.add('hidden');
    });
    
    cancelEditBtn.addEventListener('click', function() {
        editModal.classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.add('hidden');
        }
    });
    
    // 保存编辑
    saveEditBtn.addEventListener('click', function() {
        const index = parseInt(editSentenceIndex.value);
        if (index >= 0 && index < sentenceData.length) {
            // 更新数据
            const { text: processedJapanese, gender } = extractAndRemoveGenderPrefix(editJapanese.value);
            const { text: processedChinese } = extractAndRemoveGenderPrefix(editChinese.value);
            
            sentenceData[index].text = processedJapanese;
            sentenceData[index].gender = gender;
            chineseSentences[index] = processedChinese;
            
            // 重新渲染卡片
            renderAllSentenceCards();
            
            // 关闭模态框
            editModal.classList.add('hidden');
            
            showNotification('句子已成功更新', 'success');
        }
    });
    
    // 监听文本输入，更新空状态
    mixedTextarea.addEventListener('input', updateEmptyState);
}

// 处理文本函数
function processText() {
    try {
        const mixedText = mixedTextarea.value.trim();
        
        // 验证输入
        if (!mixedText) {
            showNotification('请输入文本内容', 'warning');
            mixedTextarea.focus();
            return;
        }
        
        // 按行分割文本
        const lines = mixedText.split('\n')
            .map(line => line.trim())
            .filter(line => line !== '');
        
        if (lines.length === 0) {
            showNotification('未检测到有效内容', 'warning');
            return;
        }
        
        // 检查行数是否为偶数
        if (lines.length % 2 !== 0) {
            showNotification('文本行数必须为偶数，请确保日语和中文成对输入', 'error');
            return;
        }
        
        // 分离日语和中文句子
        sentenceData = [];
        chineseSentences = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const sentences = splitByPeriod(line);
            
            if (i % 2 === 0) {
                // 处理日语句子
                sentences.forEach(sentence => {
                    if (sentence.trim() !== '') {
                        const { text: processedText, gender } = extractAndRemoveGenderPrefix(sentence);
                        sentenceData.push({
                            text: processedText,
                            gender: gender,
                            errors: [], // 存储错误位置
                            lastErrorRange: { start: 0, end: 0 }, // 存储上次错误范围
                            lastErrorToParticleRange: { start: 0, end: 0 }, // 存储上次到助词的错误范围
                            shortPlayRange: { start: 0, end: 0 } // 存储短播放范围
                        });
                    }
                });
            } else {
                // 处理中文句子
                sentences.forEach(sentence => {
                    if (sentence.trim() !== '') {
                        const { text: processedText } = extractAndRemoveGenderPrefix(sentence);
                        chineseSentences.push(processedText);
                    }
                });
            }
        }
        
        // 验证句子数量是否一致
        if (sentenceData.length !== chineseSentences.length) {
            showNotification(`日语句子数量（${sentenceData.length}）与中文句子数量（${chineseSentences.length}）不一致，请检查输入`, 'error');
            return;
        }
        
        // 显示结果区域
        resultsSection.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // 更新句子计数
        sentenceCountElement.textContent = sentenceData.length;
        
        // 渲染句子卡片
        renderAllSentenceCards(sentenceData, chineseSentences, sentencesContainer, speakJapanese);
        
        // 滚动到结果区域
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showNotification(`成功处理 ${sentenceData.length} 个句子`, 'success');
    } catch (error) {
        console.error('处理文本时出错:', error);
        showNotification('处理文本时发生错误，请检查输入格式', 'error');
    }
}

// 导出函数供其他模块使用
export { speakJapanese };

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
