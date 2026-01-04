import { fileToBase64 } from "../utils/fileToBase64";

export function useFileUpload() {
    const convertFile = async (file: File | null): Promise<string | null> => {
      if (!file) return null;
  
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };
  
    return { convertFile };
  }