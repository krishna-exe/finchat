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

      </object>
    </div>
  );
};

export default PDFViewer;