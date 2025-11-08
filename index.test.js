/**
 * 测试文件：验证句子处理逻辑
 */

// 模拟HTML中的函数
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

// 测试数据
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

describe('日语句子处理测试', () => {
    test('splitByPeriod 应该按句号分割并保留标点符号', () => {
        const result = splitByPeriod(defaultText);
        
        // 打印结果以查看
        console.log('分割后的句子数量:', result.length);
        result.forEach((sentence, index) => {
            console.log(`${index + 1}. ${sentence}`);
        });
        
        // 验证分割结果
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toContain('。');
    });

    test('extractAndRemoveGenderPrefix 应该正确提取性别标识', () => {
        const sentences = splitByPeriod(defaultText);
        const processedSentences = sentences.map(sentence => {
            return extractAndRemoveGenderPrefix(sentence);
        });
        
        console.log('\n处理后的句子和性别标识:');
        processedSentences.forEach((item, index) => {
            console.log(`${index + 1}. [${item.gender || 'null'}] ${item.text}`);
        });
        
        // 验证至少有一些句子有性别标识
        const withGender = processedSentences.filter(s => s.gender !== null);
        expect(withGender.length).toBeGreaterThan(0);
    });

    test('验证处理流程的完整结果', () => {
        const sentences = splitByPeriod(defaultText);
        const sentenceData = [];
        const chineseSentences = [];
        
        sentences.forEach(sentence => {
            if (sentence.trim() !== '') {
                const { text: processedText, gender } = extractAndRemoveGenderPrefix(sentence);
                sentenceData.push({
                    text: processedText,
                    gender: gender,
                });
                chineseSentences.push('');
            }
        });
        
        console.log('\n最终处理结果:');
        console.log(`总句子数: ${sentenceData.length}`);
        sentenceData.forEach((sentence, index) => {
            console.log(`\n句子 ${index + 1}:`);
            console.log(`  性别: ${sentence.gender || '无'}`);
            console.log(`  内容: ${sentence.text}`);
        });
        
        expect(sentenceData.length).toBe(chineseSentences.length);
        expect(sentenceData.length).toBeGreaterThan(0);
    });

    test('检查换行符是否被正确处理', () => {
        const testText = `女の学生はこの後何
をしなければなりませんか。`;
        
        const result = splitByPeriod(testText);
        console.log('\n换行符处理测试:');
        console.log('输入:', JSON.stringify(testText));
        console.log('输出:', result);
        
        // 应该只有一个句子，且不含换行
        expect(result.length).toBe(1);
        expect(result[0]).not.toContain('\n');
        expect(result[0]).toBe('女の学生はこの後何をしなければなりませんか。');
    });

    test('检查性别标识提取是否正确', () => {
        const testCases = [
            { input: '女:これは何ですか。', expectedGender: 'female', expectedText: 'これは何ですか。' },
            { input: '男：わかりました。', expectedGender: 'male', expectedText: 'わかりました。' },
            { input: 'これは何ですか。', expectedGender: null, expectedText: 'これは何ですか。' },
        ];
        
        console.log('\n性别标识提取测试:');
        testCases.forEach((testCase, index) => {
            const result = extractAndRemoveGenderPrefix(testCase.input);
            console.log(`测试 ${index + 1}: ${testCase.input} -> [${result.gender}] ${result.text}`);
            expect(result.gender).toBe(testCase.expectedGender);
            expect(result.text).toBe(testCase.expectedText);
        });
    });
});
