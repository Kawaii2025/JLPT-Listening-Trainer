// 语音合成功能

// 日语语音合成函数
export function speakJapanese(text, gender = null) {
    // 创建语音合成对象
    const utterance = new SpeechSynthesisUtterance(text);
    
    // 设置语音属性
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9; // 语速略慢，便于学习
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 根据性别选择不同的语音
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // 尝试根据性别选择语音
    if (gender === '男') {
        selectedVoice = voices.find(voice => 
            voice.lang === 'ja-JP' && 
            voice.name.includes('male') || 
            voice.name.includes('Male') || 
            voice.name.includes('MALE')
        );
    } else if (gender === '女') {
        selectedVoice = voices.find(voice => 
            voice.lang === 'ja-JP' && 
            voice.name.includes('female') || 
            voice.name.includes('Female') || 
            voice.name.includes('FEMALE')
        );
    }
    
    // 如果没有找到特定性别的语音，使用第一个日语语音
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'ja-JP');
    }
    
    // 如果找到合适的语音，则设置
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    // 播放语音
    window.speechSynthesis.speak(utterance);
}

// 初始化语音合成
export function initSpeechSynthesis() {
    window.speechSynthesis.onvoiceschanged = function() {
        console.log('语音合成已准备就绪');
    };
}

// 导出默认对象
export default {
    speakJapanese,
    initSpeechSynthesis
};
