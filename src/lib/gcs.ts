import { Storage } from '@google-cloud/storage';

export async function uploadFile(file:File){
    try {
        const storage=new Storage();
        const BucketName="uploaded_pdfs";
        const options={destination:'file.pdf'};
        // const keyFileName="C:/Users/Aayush/AppData/Roaming/gcloud/application_default_credentials.json";
        await storage.bucket(BucketName).upload(file.name, options);
        console.log(`${file.name} uploaded to ${BucketName}`);
    }
    catch (error) {
        console.error(error);
    }
}

export function getURL(file_key:string){
    // TODO: add this function to get gcs url
}