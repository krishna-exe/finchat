"use client";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 10,
    onDrop: async (acceptedFiles) => {
      try {
        setUploading(true);
    
        const uploadPromises = acceptedFiles.map(async (file) => {
          const data = await uploadToS3(file);
          if (!data?.file_key ||!data.file_name) {
            toast.error("Something went wrong with the file: " + file.name);
            return;
          }
          return { file, data };
        });
    
        const uploadResults = await Promise.allSettled(uploadPromises);
    
        const successfulUploads = uploadResults.filter(
          (result) => result.status === "fulfilled"
        ) as Array<PromiseFulfilledResult<{ file: File; data: { file_key: string; file_name: string; }; }>>;
    
        const chatData = successfulUploads.map((upload) => upload.value.data);
        chatData.forEach((data) => {
          mutate(data, {
            onSuccess: (chatData) => {
              if (chatData && chatData.chat_id) {
                toast.success("Chat created!");
                router.push(`/chat/${chatData.chat_id}`);
              }
            },
            onError: (err) => {
              toast.error("Error creating chat");
              console.error(err);
            },
          });
        });
      } catch (error) {
        toast.error("Error uploading PDF");
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            {/* loading state */}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Uploading PDF...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
