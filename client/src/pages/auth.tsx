import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Mail, Lock, User, Database } from 'lucide-react';

export default function Auth() {
  const [location, navigate] = useLocation();
  const { login, register, verifyOtp, resendOtp, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [otpCode, setOtpCode] = useState('');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') {
      setMode('register');
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (result.success && result.requiresOtp) {
          setStep('otp');
          toast({
            title: 'OTP Sent',
            description: 'Please check your email for the verification code.',
          });
        } else if (!result.success) {
          toast({
            title: 'Login Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      } else {
        const result = await register(email, password, name, role);
        if (result.success && result.requiresOtp) {
          setStep('otp');
          toast({
            title: 'Registration Successful',
            description: 'Please check your email for the verification code.',
          });
        } else if (!result.success) {
          toast({
            title: 'Registration Failed',
            description: result.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await verifyOtp(email, otpCode);
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Authentication successful!',
        });
        navigate('/');
      } else {
        toast({
          title: 'Verification Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await resendOtp(email);
      if (result.success) {
        toast({
          title: 'OTP Resent',
          description: 'Please check your email for the new verification code.',
        });
      } else {
        toast({
          title: 'Failed to Resend',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground">
            {step === 'auth' ? 'Welcome to DataNestX' : 'Verify Your Email'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {step === 'auth' 
              ? 'Sign in to your account or create a new one'
              : 'Enter the verification code sent to your email'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            {step === 'auth' ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">Secure Authentication</CardTitle>
                <CardDescription className="text-center">
                  We use OTP verification to keep your account secure
                </CardDescription>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center">Check Your Email</CardTitle>
                <CardDescription className="text-center">
                  We sent a 6-digit code to {email}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {step === 'auth' ? (
              <Tabs value={mode} onValueChange={(value) => setMode(value as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email Address</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <RadioGroup value={role} onValueChange={(value) => setRole(value as 'buyer' | 'seller')}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="buyer" id="buyer" />
                          <Label htmlFor="buyer">Buyer - I want to purchase datasets</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="seller" id="seller" />
                          <Label htmlFor="seller">Seller - I want to sell datasets</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handleOtpVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl font-mono tracking-widest"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Login'}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {step === 'auth' && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
