declare namespace RHU
{
    interface Modules
    {
        "rhu/file": RHU.File;
    }

    interface File
    {
        
        Type: RHU.File.Type;

        getType(blob: Blob): Promise<[string, string]>;
    }

    namespace File
    {
        interface Type
        {
            readonly unknown: "unknown";
            readonly png: "png";
            readonly gif: "gif";
            readonly jpg: "jpg";
            readonly txt: "txt";
            readonly js: "text/javascript";
            readonly mp4: "video/mp4";
            readonly mkv: "video/x-matroska";

            toType(blobType: string): string;
        }
    }
}