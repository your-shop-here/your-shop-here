import { useEffect, useState } from "react";

function useIframeData() : any {
    const [iframeData, setIframeData] = useState(null as any);

    useEffect(() => {
      window.parentIFrame.getPageInfo(setIframeData)
      return () => {
        window.parentIFrame.getPageInfo(false)
      };
    }, []);

    if (iframeData) {
      iframeData.iframeId = window.parentIFrame.getId()
    }

    return iframeData;
}


export default useIframeData;
