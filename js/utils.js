// ユーティリティ関数

// 按行分割句子
export function splitByPeriod(text) {
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
}

// 检查是否包含日语字符
export function containsJapanese(text) {
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text);
}

// 提取并移除性别标识前缀
export function extractAndRemoveGenderPrefix(text) {
    let gender = null;
    let processedText = text;
    
    // 检查是否有性别标识前缀
    const genderPrefixRegex = /^(男|女):\s*/;
    const match = text.match(genderPrefixRegex);
    
    if (match) {
        gender = match[1];
        processedText = text.replace(genderPrefixRegex, '');
    }
    
    return { text: processedText, gender };
}

// 查找下一个助词的位置
export function findNextParticlePosition(text, currentPosition = 0) {
    const particles = [
        'は', 'が', 'を', 'に', 'で', 'と', 'から', 'まで', 'より', 'へ', 'の',
        'か', 'や', 'も', 'ね', 'よ', 'な', 'さ', 'ば', 'って', 'ってね', 'て', 'で',
        'という', 'だけ', 'しか', 'ほど', 'くらい', 'など', 'ばかり', 'だけ', 'から', 'まで'
    ];
    
    let nextPosition = -1;
    let nextParticle = null;
    
    for (let i = currentPosition; i < text.length; i++) {
        // 尝试匹配各种长度的助词
        for (let j = 0; j < particles.length; j++) {
            const particle = particles[j];
            if (i + particle.length <= text.length && 
                text.substring(i, i + particle.length) === particle) {
                
                // 如果找到了助词，检查它是否是单词的一部分
                // 简单检查：前面是否是空格或标点，或者是句子开头
                if (i === 0 || /[\s　、，。．！？？！]/.test(text[i-1])) {
                    nextPosition = i;
                    nextParticle = particle;
                    return { position: nextPosition, particle: nextParticle };
                }
            }
        }
    }
    
    return { position: -1, particle: null };
}

// 查找第n个助词的位置
export function findNthParticlePosition(text, n) {
    let currentPosition = 0;
    let count = 0;
    
    while (count < n) {
        const result = findNextParticlePosition(text, currentPosition);
        
        if (result.position === -1) {
            break;
        }
        
        count++;
        currentPosition = result.position + 1;
        
        if (count === n) {
            return { position: result.position, particle: result.particle };
        }
    }
    
    return { position: -1, particle: null };
}

// 比较文本并记录错误
export function compareTexts(userText, correctText) {
    const errors = [];
    let correct = true;
    
    // 找出较短的文本长度
    const minLength = Math.min(userText.length, correctText.length);
    
    // 逐字比较
    for (let i = 0; i < minLength; i++) {
        if (userText[i] !== correctText[i]) {
            errors.push(i);
            correct = false;
        }
    }
    
    // 检查文本长度差异
    if (userText.length !== correctText.length) {
        correct = false;
        
        // 如果用户文本较短，添加缺少的字符位置
        if (userText.length < correctText.length) {
            for (let i = userText.length; i < correctText.length; i++) {
                errors.push(i);
            }
        }
    }
    
    return { correct, errors };
}
