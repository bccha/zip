import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "title": "Zip Manager",
            "compress": "Compression",
            "extract": "Extraction",
            "openZip": "Open Zip",
            "extractAll": "Extract All",
            "close": "Close",
            "dragDrop": "Drag & Drop Files here to Add",
            "dragDropZip": "Drag & Drop a .zip file here",
            "orClick": "or click below to browse",
            "filesToCompress": "Files to Compress",
            "makeZip": "Make Zip",
            "emptyList": "List is empty.",
            "successCompressed": "Success! Compressed to",
            "successExtracted": "Success! Extracted to",
            "error": "Error"
        }
    },
    ko: {
        translation: {
            "title": "Zip 매니저",
            "compress": "압축하기",
            "extract": "압축풀기",
            "openZip": "Zip 열기",
            "extractAll": "모두 풀기",
            "close": "닫기",
            "dragDrop": "여기에 파일을 드래그해서 추가하세요",
            "dragDropZip": "여기에 .zip 파일을 드래그하세요",
            "orClick": "또는 아래 버튼을 클릭하세요",
            "filesToCompress": "압축할 파일 목록",
            "makeZip": "압축 파일 만들기",
            "emptyList": "목록이 비어있습니다.",
            "successCompressed": "성공! 압축 완료:",
            "successExtracted": "성공! 압축 해제 완료:",
            "error": "오류"
        }
    },
    zh: {
        translation: {
            "title": "Zip 管理器",
            "compress": "压缩",
            "extract": "解压",
            "openZip": "打开 Zip",
            "extractAll": "全部解压",
            "close": "关闭",
            "dragDrop": "拖放文件到此处添加",
            "dragDropZip": "拖放 .zip 文件到此处",
            "orClick": "或点击下方浏览",
            "filesToCompress": "待压缩文件",
            "makeZip": "创建 Zip",
            "emptyList": "列表为空",
            "successCompressed": "成功！已压缩至",
            "successExtracted": "成功！已解压至",
            "error": "错误"
        }
    },
    es: {
        translation: {
            "title": "Administrador Zip",
            "compress": "Compresión",
            "extract": "Extracción",
            "openZip": "Abrir Zip",
            "extractAll": "Extraer Todo",
            "close": "Cerrar",
            "dragDrop": "Arrastra y suelta archivos aquí",
            "dragDropZip": "Arrastra un archivo .zip aquí",
            "orClick": "o haz clic abajo para buscar",
            "filesToCompress": "Archivos para comprimir",
            "makeZip": "Crear Zip",
            "emptyList": "La lista está vacía",
            "successCompressed": "¡Éxito! Comprimido en",
            "successExtracted": "¡Éxito! Extraído en",
            "error": "Error"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || "ko", // Load from storage or default
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
