"use client"

import * as React from "react"
import { CheckCircle, RefreshCw, Mail, Link as LinkIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useNavigate, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AnimatedOTPInput } from "@/components/ui/otp-input"
import { useAuth } from "../context/AuthContext"
import { generateOTP, sendOTPEmail, sendMagicLinkEmail } from "../services/emailService"

export default function LoginPage() {
  const [step, setStep] = React.useState<"email" | "otp" | "link_sent">("email")
  const [email, setEmail] = React.useState("")
  const [otpValue, setOtpValue] = React.useState("")
  const [expectedOTP, setExpectedOTP] = React.useState("")
  
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || "/"

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (from !== "/") {
        navigate(from, { replace: true })
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, from])

  // Capturar el Magic Link al cargar la página
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const magic = params.get("magic");
    
    if (magic) {
      setIsLoading(true);
      try {
        const decodedEmail = atob(magic);
        login(decodedEmail, "link").then((profile) => {
          setIsSuccess(true);
          window.history.replaceState({}, document.title, window.location.pathname);
          setTimeout(() => {
            if (from !== "/") {
              navigate(from, { replace: true });
            } else if (profile?.role === "admin") {
              navigate("/admin", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }, 1000);
        }).catch(err => {
          console.error(err);
          setError("Error al iniciar sesión con el link.");
          setIsLoading(false);
        });
      } catch (e) {
        setError("El link es inválido.");
        setIsLoading(false);
      }
    }
  }, [login, navigate, from]);

  const validateEmail = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor ingresa un correo electrónico válido.")
      return false
    }
    setError("")
    return true
  }

  const handleSendOTP = async () => {
    if (!validateEmail()) return
    setIsLoading(true)
    try {
      const code = generateOTP()
      setExpectedOTP(code)
      await sendOTPEmail(email, code)
      setStep("otp")
    } catch (err) {
      console.error(err)
      setError("Hubo un error al enviar el código. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendLink = async () => {
    if (!validateEmail()) return
    setIsLoading(true)
    try {
      // Creamos un link simple codificando el email en base64
      const token = btoa(email);
      const magicLink = `${window.location.origin}/login?magic=${token}`;
      
      await sendMagicLinkEmail(email, magicLink);
      setStep("link_sent")
    } catch (err: any) {
      console.error(err)
      setError("Error al enviar el link.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteOTP = async (otp: string) => {
    setOtpValue(otp)
    setError("")
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 800))

    if (otp === expectedOTP) {
      setIsSuccess(true)
      try {
        const profile = await login(email, "otp")
        setTimeout(() => {
          if (from !== "/") {
            navigate(from, { replace: true })
          } else if (profile.role === "admin") {
            navigate("/admin", { replace: true })
          } else {
            navigate("/dashboard", { replace: true })
          }
        }, 1000)
      } catch (err: any) {
        console.error("Login error:", err)
        setError(`Error al iniciar sesión: ${err.message || "Error de base de datos"}`)
        setIsSuccess(false)
      }
    } else {
      setError("El código es incorrecto.")
      setOtpValue("") // reset for retry
    }
    
    setIsLoading(false)
  }

  const handleReset = () => {
    setStep("email")
    setOtpValue("")
    setExpectedOTP("")
    setError("")
    setIsSuccess(false)
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold">
            {step === "email" && "Iniciar Sesión"}
            {step === "otp" && "Verifica tu Código"}
            {step === "link_sent" && "Revisa tu Correo"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Ingresa tu correo y elige cómo deseas entrar"}
            {step === "otp" && `Ingresa el código de 6 dígitos que enviamos a ${email}`}
            {step === "link_sent" && `Hemos enviado un link mágico a ${email}. Haz clic en él para entrar.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200 text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div
                key="email-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      placeholder="tu@correo.com" 
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading || isSuccess}
                    />
                  </div>
                </div>
                
                {isSuccess ? (
                  <div className="flex items-center justify-center space-x-2 text-green-600 py-4">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">¡Inicio de sesión exitoso!</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button 
                      type="button" 
                      onClick={handleSendOTP} 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      Recibir Código OTP
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleSendLink} 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
                      Recibir Link de Acceso
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-center">
                  <AnimatedOTPInput
                    value={otpValue}
                    onChange={setOtpValue}
                    onComplete={handleCompleteOTP}
                    maxLength={6}
                    disabled={isLoading || isSuccess}
                  />
                </div>

                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-2 text-green-600"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      ¡Código verificado con éxito!
                    </span>
                  </motion.div>
                )}

                {isLoading && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center space-x-2 text-muted-foreground"
                  >
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </motion.div>
                )}

                <div className="flex justify-center pt-2">
                  <Button variant="ghost" onClick={handleReset} className="text-sm" disabled={isLoading || isSuccess}>
                    ¿No recibiste el código? Cambiar correo
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "link_sent" && (
              <motion.div
                key="link-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4 py-4"
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-center text-sm text-slate-600">
                  Hemos enviado un enlace a tu correo. Ábrelo para iniciar sesión.
                </p>
                <Button variant="ghost" onClick={handleReset}>
                  Volver
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

