import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaSignInAlt, FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Logo = () => (
  <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:900, fontSize:22, color:"#111", letterSpacing:"-0.5px" }}>
    Unidrives<span style={{ color:"#FF5A3C", fontSize:28, lineHeight:1 }}>.</span>
  </span>
);

// OTP Input component
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0,6);

  const handleChange = (i, e) => {
    const v = e.target.value.replace(/\D/g,"").slice(-1);
    const next = [...digits];
    next[i] = v;
    onChange(next.join(""));
    if (v && i < 5) inputs.current[i+1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i-1]?.focus();
      const next = [...digits];
      next[i-1] = "";
      onChange(next.join(""));
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    onChange(paste.padEnd(6,"").slice(0,6));
    inputs.current[Math.min(paste.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i}
          ref={el => inputs.current[i] = el}
          type="tel" maxLength={1} value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl bg-gray-50 text-[#111] outline-none transition-all focus:border-[#FF5A3C] focus:bg-white focus:shadow-sm"
          style={{ borderColor: d ? "#FF5A3C" : undefined }}
        />
      ))}
    </div>
  );
}

export default function AuthPage({ navigate, showToast }) {
  const { login, register, loading } = useAuth();
  const [tab,  setTab]  = useState("login");
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"" });
  const [err,  setErr]  = useState("");

  // OTP flow states
  const [otpStep,    setOtpStep]    = useState(false); // false = form, true = otp
  const [otp,        setOtp]        = useState("");
  const [otpSent,    setOtpSent]    = useState(false);
  const [otpTimer,   setOtpTimer]   = useState(0);
  const [pendingReg, setPendingReg] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (otpTimer > 0) {
      timerRef.current = setTimeout(() => setOtpTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timerRef.current);
  }, [otpTimer]);

  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const inp = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-[#111] outline-none focus:border-[#FF5A3C] focus:bg-white transition-all placeholder-gray-400";

  const goAfterLogin = (user) => {
    if (user.role==="admin")  { navigate("adminpanel"); return; }
    if (user.role==="driver") { navigate("driver");     return; }
    navigate("dashboard");
  };

  const handleLogin = async () => {
    setErr("");
    if (!form.email || !form.password) return setErr("Please fill all fields");
    const res = await login(form.email, form.password);
    if (res.success) { showToast(`Welcome back, ${res.user.name}!`); goAfterLogin(res.user); }
    else setErr(res.message);
  };

  // Step 1: validate form then send OTP
  const handleSendOtp = async () => {
    setErr("");
    if (!form.name || !form.email || !form.phone || !form.password)
      return setErr("Please fill all fields");
    if (!/^\+?[0-9]{10,13}$/.test(form.phone.replace(/\s/g,"")))
      return setErr("Enter a valid phone number");
    // Simulate OTP send (replace with real API call)
    setPendingReg(form);
    setOtpStep(true);
    setOtpSent(true);
    setOtpTimer(30);
    setOtp("");
    showToast("OTP sent to " + form.phone);
  };

  // Step 2: verify OTP then register
  const handleVerifyOtp = async () => {
    setErr("");
    if (otp.length < 6) return setErr("Enter the 6-digit OTP");
    // For demo: accept "123456" as valid OTP
    if (otp !== "123456") return setErr("Invalid OTP. (Demo: use 123456)");
    const res = await register(pendingReg);
    if (res.success) { showToast("Account created! Welcome 🎉"); navigate("dashboard"); }
    else setErr(res.message);
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpTimer(30);
    showToast("OTP resent to " + form.phone);
  };

  const handleGoogle = () => showToast("Google sign-in coming soon!");
  const handleKey = fn => e => { if (e.key==="Enter") fn(); };

  const resetTab = (t) => { setTab(t); setErr(""); setOtpStep(false); setOtp(""); };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Logo />
          <p className="text-gray-500 text-sm mt-1">Student transport made simple</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-100">
            {[{ key:"login", label:"Login", Icon:FaSignInAlt },{ key:"register", label:"Register", Icon:FaUserPlus }].map(({ key, label, Icon }) => (
              <button key={key} onClick={() => resetTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
                  tab===key ? "text-[#FF5A3C] border-b-2 border-[#FF5A3C] bg-white" : "text-gray-400 hover:text-gray-600"
                }`}>
                <Icon className="text-xs" />{label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* LOGIN TAB */}
            {tab==="login" && (
              <>
                <button onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all mb-5 shadow-sm">
                  <FcGoogle size={18} />Continue with Google
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {err && <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl mb-4 border border-red-100 font-medium">{err}</div>}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wide flex items-center gap-1"><FaEnvelope />Email</label>
                    <input type="email" placeholder="your@email.com" className={inp} value={form.email} onChange={upd("email")} onKeyDown={handleKey(handleLogin)} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wide flex items-center gap-1"><FaLock />Password</label>
                    <input type="password" placeholder="Your password" className={inp} value={form.password} onChange={upd("password")} onKeyDown={handleKey(handleLogin)} />
                  </div>
                  <button onClick={handleLogin} disabled={loading}
                    className="w-full bg-[#111] text-white py-3.5 rounded-xl font-bold hover:bg-[#FF5A3C] active:scale-[0.98] transition-colors mt-1 disabled:opacity-60 text-sm">
                    {loading ? "Logging in…" : "Login →"}
                  </button>
                 
                  <p className="text-center text-xs text-gray-500">No account? <button onClick={() => resetTab("register")} className="text-[#FF5A3C] font-bold">Register free</button></p>
                </div>
              </>
            )}

            {/* REGISTER TAB — FORM STEP */}
            {tab==="register" && !otpStep && (
              <>
                <button onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all mb-5 shadow-sm">
                  <FcGoogle size={18} />Continue with Google
                </button>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                {err && <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl mb-4 border border-red-100 font-medium">{err}</div>}
                <div className="flex flex-col gap-4">
                  {[
                    { key:"name",     label:"Full Name", type:"text",     ph:"Your full name",       Icon:FaUser },
                    { key:"email",    label:"Email",      type:"email",    ph:"you@galgotias.edu.in", Icon:FaEnvelope },
                    { key:"phone",    label:"Phone",      type:"tel",      ph:"+91 XXXXX XXXXX",      Icon:FaPhone },
                    { key:"password", label:"Password",   type:"password", ph:"Min 6 characters",     Icon:FaLock },
                  ].map(({ key, label, type, ph, Icon }) => (
                    <div key={key}>
                      <label className="text-xs text-gray-500 font-semibold mb-1.5 block uppercase tracking-wide flex items-center gap-1"><Icon />{label}</label>
                      <input type={type} placeholder={ph} className={inp} value={form[key]} onChange={upd(key)} />
                    </div>
                  ))}
                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full bg-[#111] text-white py-3.5 rounded-xl font-bold hover:bg-[#FF5A3C] active:scale-[0.98] transition-colors mt-1 disabled:opacity-60 text-sm flex items-center justify-center gap-2">
                    <FaPhone className="text-xs" />
                    {loading ? "Sending OTP…" : "Send OTP →"}
                  </button>
                  <p className="text-center text-xs text-gray-500">Have an account? <button onClick={() => resetTab("login")} className="text-[#FF5A3C] font-bold">Login</button></p>
                </div>
              </>
            )}

            {/* REGISTER TAB — OTP STEP */}
            {tab==="register" && otpStep && (
              <div className="flex flex-col gap-5">
                <button onClick={() => { setOtpStep(false); setErr(""); }}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#FF5A3C] transition-colors font-medium -mb-1">
                  <FaArrowLeft />Back
                </button>

                <div className="text-center">
                  <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-orange-100">
                    <FaShieldAlt className="text-[#FF5A3C] text-xl" />
                  </div>
                  <h3 className="font-bold text-[#111] text-base">Verify Your Phone</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    OTP sent to <span className="font-semibold text-[#111]">{form.phone}</span>
                  </p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">(Demo: enter 123456)</p>
                </div>

                {err && <div className="bg-red-50 text-red-600 text-xs px-4 py-3 rounded-xl border border-red-100 font-medium text-center">{err}</div>}

                <div>
                  <p className="text-xs text-gray-500 text-center mb-3 font-medium">Enter 6-digit OTP</p>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                  className="w-full bg-[#FF5A3C] text-white py-3.5 rounded-xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-md">
                  {loading ? "Verifying…" : "Verify & Create Account →"}
                </button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-xs text-gray-400">Resend in <span className="font-bold text-[#111]">{otpTimer}s</span></p>
                  ) : (
                    <button onClick={handleResendOtp} className="text-xs text-[#FF5A3C] font-bold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
