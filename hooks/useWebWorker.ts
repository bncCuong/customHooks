/** @format */

/**
 Webworker dùng để xử lý công việc nặng hoặc phức tạp trên luồng riêng biệt bằng Web Worker, 
 giúp không làm chậm giao diện chính của ứng dụng
 */
import { useCallback, useEffect, useState } from "react";

interface WorkerProps {
  webWorkerFn: () => void;
  inputData: any;
}

const useWebWorker = ({ webWorkerFn, inputData }: WorkerProps) => {
  const [loading, setLoading] = useState<Boolean>(false);
  const [error, setError] = useState<String | null>(null);
  const [result, setResult] = useState(null);

  //Ghi nhớ hàm webWorkerFn để tránh tạo lại khi không cần thiết
  const memoizedWorkerFn = useCallback(webWorkerFn, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      //Biến webWorkerFn thành chuỗi để nhúng vào một script độc lập
      const code = memoizedWorkerFn.toString();

      //Blob là một đối tượng chứa code JavaScript
      const blob = new Blob([`(${code})()`], {
        type: "application/javascript",
      });

      //tạo URL để Worker có thể truy cập mã.
      const workerScriptUrl = URL.createObjectURL(blob);

      //khởi tạo Worker với script được cung cấp.
      const worker = new Worker(workerScriptUrl);

      //worker nhận data và xử lý
      worker.postMessage(inputData);

      // worker trả về data đã xử lý
      worker.onmessage = (e: MessageEvent) => {
        setResult(e.data);
        setLoading(false);
      };

      worker.onerror = (e: ErrorEvent) => {
        setError(e.message as String | null);
        setLoading(false);
      };

      //Đảm bảo không để lại Worker hoặc Blob không cần thiết khi component bị gỡ bỏ.
      return () => {
        worker.terminate();
        URL.revokeObjectURL(workerScriptUrl);
      };
    } catch (error) {
      setError(error?.message);
      setLoading(false);
    }
  }, [memoizedWorkerFn, inputData]);

  return { result, error, loading };
};

export default useWebWorker;

//Cách sử dụng
/**
 tạo function xử lý data ở component

 //không tạo arrow fn, vì cần dùng this
 const function webWorkerFn() {
    this.onmessage = function(e) {
        this.postMessage("Message from worker fn")
    }
    const {result, loading, error} = useWebWorker(webWorkerFn, "Input data send to Worker")
 }
  
 */
