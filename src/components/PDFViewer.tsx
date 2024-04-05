import React from "react";

type Props = { pdf_url: string };

const PDFViewer = ({ pdf_url }: Props) => {
  return (
    <div>
      <object
        data={pdf_url}
        type="application/pdf"
        width="100%"
        height="685px"
      >
        <p>
          Your web browser doesn't have a PDF plugin. Instead, you can{" "}
          <a href={pdf_url}>click here to download the PDF file.</a>
        </p>
      </object>
    </div>
  );
};

export default PDFViewer;