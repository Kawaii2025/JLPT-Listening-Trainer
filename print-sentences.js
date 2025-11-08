// 简单的句子处理脚本
function splitByPeriod(text) {
    // 先去掉换行符（换行符之间没有真实的空格）
    const cleanedText = text.replace(/\n+/g, '').trim();
    
    // 先按句号、感叹号、问号分割，但保留标点符号
    let sentences = cleanedText.split(/(?<=[。！？])/);
    
    // 再按性别标识分割（女: 、男: 、女： 、男：）
    sentences = sentences.flatMap(sentence => {
        return sentence.split(/(?=[女男男女][：:])/);
    });
    
    return sentences
        .map(s => s.trim())
        .filter(s => s !== '');
}

function extractAndRemoveGenderPrefix(text) {
    const genderMatch = text.match(/^([男女男女])([:：])/);
    
    if (genderMatch) {
        const gender = genderMatch[1];
        const processedText = text.replace(/^[男女男女][:：]/, '').trim();
        return {
            text: processedText,
            gender: gender === '男' || gender === '男' ? 'male' : 'female'
        };
    }
    
    return {
        text: text.trim(),
        gender: null
    };
}

const defaultText = `大学の演劇サ一クルで女の学生と部長の男の学生が話しています。女の学生はこの後何
をしなければなりませんか。
女:鈴木さん。来週の新入生勧誘のためのサ一クル体験会、ポスタ一を見た人から早速
参加の申し込みが来てますね。
男:うん、準備進めないとね。当日来てくれた人には演劇を一部実際に体験してもらう
よね？その時に使うシ一ン、台本から候補選ぶのお願いしてたけど、どう?
女:はい。体験者が多くても使えそうなシンを3つピックアップしました。
男:じゃ、その中から僕が選んでセリフを印刷しておくよ。あと当日は受付とか誘導と
かみんなにも手伝ってもらうから誰が何を担当するか割り振ってほしいんだ。
女:わかりました。えっと、当日配る入部案内のチラシの準備は?
男：ああ、それは2年生に印刷してもらおうと思ってるんだ。僕から頼んでおくよ。
女：わかりました。
女の学生はこの後何をしなければなりませんか。`;

const sentences = splitByPeriod(defaultText);
const result = sentences.map((sentence, index) => {
    const { text, gender } = extractAndRemoveGenderPrefix(sentence);
    return {
        index: index + 1,
        gender: gender || '无',
        text: text
    };
});

// 优化：无性别的句子继承前一个句子的性别
const optimizedResult = result.map((item, index) => {
    if (item.gender === '无' && index > 0) {
        // 向前查找最近的有性别的句子
        for (let i = index - 1; i >= 0; i--) {
            if (result[i].gender !== '无') {
                return {
                    ...item,
                    gender: result[i].gender,
                    inherited: true
                };
            }
        }
    }
    return {
        ...item,
        inherited: false
    };
});

console.log('='.repeat(80));
console.log('处理结果总结');
console.log('='.repeat(80));
console.log(`\n总句子数: ${optimizedResult.length}\n`);

optimizedResult.forEach(item => {
    const genderDisplay = item.inherited ? `${item.gender}*` : item.gender;
    console.log(`${item.index.toString().padStart(2, '0')}. [${genderDisplay.padEnd(3, ' ')}] ${item.text}`);
});

console.log('\n注: *表示继承自前一个句子的性别\n');
console.log('='.repeat(80));
