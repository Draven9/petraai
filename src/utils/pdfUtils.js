import * as pdfjsLib from 'pdfjs-dist';

// Import worker directly for Vite compatibility
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extrai texto de um arquivo PDF (File object)
 * @param {File} file 
 * @returns {Promise<string>} Texto extraído concatenado
 */
export async function extractTextFromPdf(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';

        // Iterar por todas as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += ` ${pageText}`;
        }

        return fullText.trim();
    } catch (error) {
        console.error('Erro ao extrair texto do PDF:', error);
        throw new Error('Falha na leitura do PDF. O arquivo pode estar corrompido ou protegido.');
    }
}
