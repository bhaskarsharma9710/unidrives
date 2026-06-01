export default function Toast({ message, type = "success" }) {
  const styles = {
    success: "bg-[#111] text-white",
    error:   "bg-red-600 text-white",
    info:    "bg-blue-600 text-white",
  };
  return (
    <div className={`fixed bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:max-w-sm ${styles[type] || styles.success} px-5 py-3.5 rounded-xl text-sm font-semibold z-[300] shadow-2xl flex items-center gap-2`}
      style={{ animation:"slideUp 0.3s ease" }}>
      {message}
    </div>
  );
}
