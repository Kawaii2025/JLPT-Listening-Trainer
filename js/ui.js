// 导入其他模块
import { compareTexts, findNextParticlePosition } from './utils.js';

// 更新对比结果
export function updateComparisonResult(card, index, sentenceData) {
    const userInput = card.querySelector('.user-input').value;
    const originalText = sentenceData[index].text;
    
    // 比较文本
    const comparisonResult = compareTexts(userInput, originalText);
    
    // 更新句子数据中的错误信息
    sentenceData[index].errors = comparisonResult.errors;
    
    // 计算错误范围
    if (comparisonResult.errors.length > 0) {
        const firstError = comparisonResult.errors[0];
        const lastError = comparisonResult.errors[comparisonResult.errors.length - 1];
        
        // 存储错误范围
        sentenceData[index].lastErrorRange = { start: firstError, end: lastError };
        
        // 计算到助词为止的范围
        const particleResult = findNextParticlePosition(originalText, lastError);
        if (particleResult.position !== -1) {
            sentenceData[index].lastErrorToParticleRange = { 
                start: Math.max(0, firstError - 2), 
                end: particleResult.position + particleResult.particle.length - 1 
            };
        } else {
            sentenceData[index].lastErrorToParticleRange = { start: firstError, end: Math.min(originalText.length - 1, lastError + 3) };
        }
        
        // 计算短播放范围
        sentenceData[index].shortPlayRange = { 
            start: Math.max(0, firstError - 1), 
            end: Math.min(originalText.length - 1, lastError + 1) 
        };
    }
    
    // 显示结果区域
    const resultElement = card.querySelector('.check-result');
    const statusElement = card.querySelector('.result-status');
    const accuracyElement = card.querySelector('.accuracy');
    const userDisplayElement = card.querySelector('.user-input-display');
    const correctDisplayElement = card.querySelector('.correct-answer-display');
    
    // 显示结果区域
    resultElement.classList.remove('hidden');
    
    // 计算准确率
    let accuracy = 0;
    if (originalText.length > 0) {
        const correctChars = originalText.length - comparisonResult.errors.length;
        accuracy = Math.round((correctChars / originalText.length) * 100);
    }
    
    // 更新UI
    if (comparisonResult.correct) {
        statusElement.textContent = '回答正确！';
        statusElement.className = 'text-sm font-medium text-green-500';
        accuracyElement.textContent = '准确率: 100%';
    } else {
        statusElement.textContent = '回答有误';
        statusElement.className = 'text-sm font-medium text-red-500';
        accuracyElement.textContent = `准确率: ${accuracy}%`;
    }
    
    // 高亮显示错误
    let highlightedUserText = userInput;
    let highlightedCorrectText = originalText;
    
    if (!comparisonResult.correct) {
        // 为了正确处理高亮，我们需要从后往前替换，避免位置偏移
        comparisonResult.errors.slice().reverse().forEach(errorPos => {
            // 高亮用户输入
            if (errorPos < userInput.length) {
                highlightedUserText = 
                    highlightedUserText.substring(0, errorPos) +
                    `<span class="bg-red-100 text-red-700 px-0.5">${userInput[errorPos] || ' '}</span>` +
                    highlightedUserText.substring(errorPos + 1);
            }
            
            // 高亮正确答案
            if (errorPos < originalText.length) {
                highlightedCorrectText = 
                    highlightedCorrectText.substring(0, errorPos) +
                    `<span class="bg-green-100 text-green-700 px-0.5">${originalText[errorPos]}</span>` +
                    highlightedCorrectText.substring(errorPos + 1);
            }
        });
    }
    
    // 更新显示内容
    userDisplayElement.innerHTML = highlightedUserText || '<span class="text-neutral-400">未输入</span>';
    correctDisplayElement.innerHTML = highlightedCorrectText;
    
    return comparisonResult;
}

// 渲染所有句子卡片
export function renderAllSentenceCards(sentenceData, chineseSentences, sentencesContainer, speakJapanese) {
    // 清空容器
    sentencesContainer.innerHTML = '';
    
    // 遍历所有句子数据
    sentenceData.forEach((sentence, index) => {
        const japaneseText = sentence.text;
        const chineseSentence = chineseSentences[index];
        
        // 创建句子卡片
        const sentenceCard = document.createElement('div');
        sentenceCard.className = 'bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-4';
        
        // 句子卡片模板
        sentenceCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <div class="flex items-center mb-2">
                        <span class="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">${index + 1}</span>
                        ${sentence.gender ? `<span class="ml-2 bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">${sentence.gender}</span>` : ''}
                    </div>
                    <textarea 
                        class="user-input w-full font-japanese text-base p-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                        placeholder="请输入您听到的日语句子..."
                        rows="3"
                    ></textarea>
                    
                    <div class="check-result hidden mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-medium result-status"></span>
                            <span class="text-xs text-neutral-500 accuracy"></span>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <span class="text-xs font-medium text-neutral-500">你的输入：</span>
                                <div class="user-input-display font-japanese text-sm p-2 bg-neutral-50 rounded"></div>
                            </div>
                            <div>
                                <span class="text-xs font-medium text-neutral-500">正确答案：</span>
                                <div class="correct-answer-display font-japanese text-sm p-2 bg-neutral-50 rounded"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 日语原文（默认隐藏） -->
                    <div class="japanese-original hidden mb-4">
                        <h4 class="text-sm font-medium text-neutral-500 mb-1">日语原文</h4>
                        <p class="font-japanese text-lg text-neutral-800">${japaneseText}</p>
                    </div>
                    
                    <!-- 中文翻译 -->
                    <div>
                        <h4 class="text-sm font-medium text-neutral-500 mb-1">中文翻译</h4>
                        <p class="text-neutral-700">${chineseSentence}</p>
                    </div>
                </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex flex-wrap gap-2 mt-4">
                <button 
                    class="play-button flex items-center justify-center text-neutral-600 hover:text-primary transition-colors"
                    data-index="${index}"
                >
                    <i class="fa fa-volume-up mr-1"></i>
                    <span class="text-sm">朗读</span>
                </button>
                
                <button 
                    class="play-error-button hidden flex items-center justify-center bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors px-2 py-1 rounded text-sm"
                    data-index="${index}"
                >
                    <i class="fa fa-play mr-1"></i>
                    <span>从错误处播放</span>
                </button>
                
                <button 
                    class="play-error-to-particle-button hidden flex items-center justify-center bg-particle/10 text-particle hover:bg-particleLight hover:text-white transition-colors px-2 py-1 rounded text-sm"
                    data-index="${index}"
                >
                    <i class="fa fa-play-circle mr-1"></i>
                    <span>到助词为止</span>
                </button>
                
                <button 
                    class="short-play-button hidden flex items-center justify-center bg-shortPlay/10 text-shortPlay hover:bg-shortPlayLight hover:text-white transition-colors px-2 py-1 rounded text-sm"
                    data-index="${index}"
                >
                    <i class="fa fa-play-circle-o mr-1"></i>
                    <span>短播放</span>
                </button>
                
                <button 
                    class="check-button flex items-center justify-center bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-colors px-2 py-1 rounded text-sm"
                    data-index="${index}"
                >
                    <i class="fa fa-check mr-1"></i>
                    <span>检查</span>
                </button>
                
                <button 
                    class="toggle-original-button flex items-center justify-center text-neutral-600 hover:text-neutral-800 transition-colors px-2 py-1 rounded text-sm"
                >
                    <i class="fa fa-eye mr-1"></i>
                    <span>显示原文</span>
                </button>
                
                <button 
                    class="edit-button flex items-center justify-center text-neutral-600 hover:text-primary transition-colors px-2 py-1 rounded text-sm ml-auto"
                    data-index="${index}"
                >
                    <i class="fa fa-pencil mr-1"></i>
                    <span>编辑</span>
                </button>
            </div>
        `;
        
        sentencesContainer.appendChild(sentenceCard);
        
        // 添加朗读按钮事件
        const playBtn = sentenceCard.querySelector('.play-button');
        playBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            speakJapanese(sentenceData[idx].text, sentenceData[idx].gender);
            
            // 按钮动画效果
            this.classList.add('text-secondary');
            setTimeout(() => {
                this.classList.remove('text-secondary');
            }, 500);
        });
        
        // 编辑按钮事件
        const editBtn = sentenceCard.querySelector('.edit-button');
        editBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const sentence = sentenceData[idx];
            const chinese = chineseSentences[idx];
            
            // 填充编辑表单
            const editSentenceIndex = document.getElementById('edit-sentence-index');
            const editGender = document.getElementById('edit-gender');
            const editJapanese = document.getElementById('edit-japanese');
            const editChinese = document.getElementById('edit-chinese');
            const editModal = document.getElementById('edit-modal');
            
            if (editSentenceIndex && editGender && editJapanese && editChinese && editModal) {
                editSentenceIndex.value = idx;
                editGender.value = sentence.gender || '';
                editJapanese.value = sentence.text;
                editChinese.value = chinese;
                
                // 显示模态框
                editModal.classList.remove('hidden');
            }
        });
        
        // "到助词为止"按钮事件 - 青色系
        const errorToParticleBtn = sentenceCard.querySelector('.play-error-to-particle-button');
        errorToParticleBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const card = this.closest('.bg-white.rounded-xl');
            
            // 1. 先更新对比结果
            const comparisonResult = updateComparisonResult(card, idx, sentenceData);
            if (!comparisonResult || comparisonResult.correct) {
                return; // 如果没有结果或回答正确，则不继续
            }
            
            // 2. 获取错误范围
            const { start, end } = sentenceData[idx].lastErrorToParticleRange;
            const originalText = sentenceData[idx].text;
            
            // 3. 朗读相应部分
            const playText = originalText.substring(
                start, 
                Math.min(end + 1, originalText.length)
            );
            
            // 4. 播放
            speakJapanese(playText, sentenceData[idx].gender);
            
            // 按钮动画效果
            this.classList.add('bg-particleLight', 'text-white');
            setTimeout(() => {
                this.classList.remove('bg-particleLight', 'text-white');
            }, 500);
        });
        
        // "短播放"按钮事件 - 粉色系
        const shortPlayBtn = sentenceCard.querySelector('.short-play-button');
        shortPlayBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const card = this.closest('.bg-white.rounded-xl');
            
            // 1. 先更新对比结果
            const comparisonResult = updateComparisonResult(card, idx, sentenceData);
            if (!comparisonResult || comparisonResult.correct) {
                return; // 如果没有结果或回答正确，则不继续
            }
            
            // 2. 获取短播放范围
            const { start, end } = sentenceData[idx].shortPlayRange;
            const originalText = sentenceData[idx].text;
            
            // 3. 朗读相应部分
            const playText = originalText.substring(
                start, 
                Math.min(end + 1, originalText.length)
            );
            
            // 4. 播放
            speakJapanese(playText, sentenceData[idx].gender);
            
            // 按钮动画效果
            this.classList.add('bg-shortPlayLight', 'text-white');
            setTimeout(() => {
                this.classList.remove('bg-shortPlayLight', 'text-white');
            }, 500);
        });
        
        // "从错误处播放"按钮事件 - 紫色系
        const errorPlayBtn = sentenceCard.querySelector('.play-error-button');
        errorPlayBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const card = this.closest('.bg-white.rounded-xl');
            
            // 1. 先更新对比结果
            const comparisonResult = updateComparisonResult(card, idx, sentenceData);
            if (!comparisonResult || comparisonResult.correct) {
                return; // 如果没有结果或回答正确，则不继续
            }
            
            // 2. 获取错误范围
            const { start, end } = sentenceData[idx].lastErrorRange;
            const originalText = sentenceData[idx].text;
            
            // 3. 朗读相应部分
            const playText = originalText.substring(
                start, 
                Math.min(end + 1, originalText.length)
            );
            
            // 4. 播放
            speakJapanese(playText, sentenceData[idx].gender);
            
            // 按钮动画效果
            this.classList.add('bg-accent', 'text-white');
            setTimeout(() => {
                this.classList.remove('bg-accent', 'text-white');
            }, 500);
        });
        
        // 显示/隐藏原文按钮事件
        const toggleBtn = sentenceCard.querySelector('.toggle-original-button');
        const originalTxt = sentenceCard.querySelector('.japanese-original');
        
        toggleBtn.addEventListener('click', function() {
            originalTxt.classList.toggle('hidden');
            const icon = this.querySelector('i');
            if (originalTxt.classList.contains('hidden')) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
        
        // 检查按钮事件
        const checkBtn = sentenceCard.querySelector('.check-button');
        checkBtn.addEventListener('click', function() {
            const idx = parseInt(this.getAttribute('data-index'));
            const card = this.closest('.bg-white.rounded-xl');
            
            // 直接调用更新对比结果的函数
            updateComparisonResult(card, idx, sentenceData);
        });
        
        // 监听用户输入变化，显示按钮
        const userInput = sentenceCard.querySelector('.user-input');
        userInput.addEventListener('input', function() {
            const errorPlayButton = card.querySelector('.play-error-button');
            const errorToParticleButton = card.querySelector('.play-error-to-particle-button');
            const shortPlayButton = card.querySelector('.short-play-button');
            
            // 只要有输入，就显示按钮
            if (this.value.trim() !== '') {
                errorPlayButton.classList.remove('hidden');
                errorToParticleButton.classList.remove('hidden');
                shortPlayButton.classList.remove('hidden');
            } else {
                errorPlayButton.classList.add('hidden');
                errorToParticleButton.classList.add('hidden');
                shortPlayButton.classList.add('hidden');
            }
        });
    });
}

// 更新空状态显示
export function updateEmptyState() {
    let mixedTextarea;
    let emptyState;
    let resultsSection;
    
    try {
        mixedTextarea = document.getElementById('mixed-text');
        emptyState = document.getElementById('empty-state');
        resultsSection = document.getElementById('results-section');
    } catch (error) {
        console.error('获取DOM元素失败:', error);
        return;
    }
    
    if (mixedTextarea && mixedTextarea.value.trim() === '') {
        if (emptyState) emptyState.classList.remove('hidden');
        if (resultsSection) resultsSection.classList.add('hidden');
    } else {
        if (emptyState) emptyState.classList.add('hidden');
    }
}

// 显示通知函数
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    
    let bgColor, icon;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-500';
            icon = 'fa-check-circle';
            break;
        case 'warning':
            bgColor = 'bg-yellow-500';
            icon = 'fa-exclamation-triangle';
            break;
        case 'error':
            bgColor = 'bg-red-500';
            icon = 'fa-times-circle';
            break;
        default:
            bgColor = 'bg-primary';
            icon = 'fa-info-circle';
    }
    
    notification.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-10 opacity-0 z-50 flex items-center`;
    notification.innerHTML = `
        <i class="fa ${icon} mr-2"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.remove('translate-y-10', 'opacity-0');
    }, 10);
    
    // 自动消失
    setTimeout(() => {
        notification.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 默认导出
export default {
    updateComparisonResult,
    renderAllSentenceCards,
    updateEmptyState,
    showNotification
};
