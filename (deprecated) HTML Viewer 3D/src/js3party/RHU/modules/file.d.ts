interface RHU
{

    File?: RHU.File;
}

declare namespace RHU
{
    interface File
    {
        
        Type: RHU.File.Type;

        getType(blob: Blob): Promise<[string, string]>;
    }

    namespace File
    {
        interface Type
        {
            unknown: "unknown";
            png: "png";
            gif: "gif";
            jpg: "jpg";
            txt: "txt";
            js: "text/javascript";
            mp4: "video/mp4";
            mkv: "video/x-matroska";

            toType(blobType: string): string;
        }
    }
}