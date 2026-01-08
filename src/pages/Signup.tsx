import { useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Layout from '@/components/Layout';
import FunnelText from '@/components/FunnelText';
import ScrollReveal from '@/components/ScrollReveal';
import { useLanguage } from '@/contexts/LanguageContext';

const Signup = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    repoUrl: '',
    useCase: '',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (formData.repoUrl && !formData.repoUrl.includes('github.com')) {
      newErrors.repoUrl = 'Please enter a valid GitHub URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const useCases = [
    { value: 'onboarding', label: 'Onboarding new developers' },
    { value: 'code-review', label: 'Code review assistance' },
    { value: 'documentation', label: 'Documentation generation' },
    { value: 'debugging', label: 'Debugging & troubleshooting' },
    { value: 'learning', label: 'Learning new codebases' },
    { value: 'other', label: 'Other' },
  ];

  if (isSuccess) {
    return (
      <Layout>
        <section className="min-h-[80vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <ScrollReveal>
              <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                You're on the list!
              </h1>
              <p className="text-muted-foreground mb-8">
                We'll reach out soon with your early access invitation. Get ready to explore codebases like never before.
              </p>
              <div className="glass-panel p-4 font-mono text-sm">
                <span className="text-muted-foreground">Confirmation sent to:</span>
                <br />
                <span className="text-primary">{formData.email}</span>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 md:py-32 px-4 md:px-8">
        <div className="container max-w-xl mx-auto text-center">
          <ScrollReveal>
            <span className="font-mono text-xs text-primary uppercase tracking-wider mb-4 block">
              Early Access
            </span>
          </ScrollReveal>
          <FunnelText
            text={t('signup.title')}
            as="h1"
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            delay={100}
          />
          <ScrollReveal delay={300}>
            <p className="text-lg text-muted-foreground">
              {t('signup.subtitle')}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Form */}
      <section className="pb-24 px-4 md:px-8">
        <div className="container max-w-lg mx-auto">
          <ScrollReveal delay={400}>
            <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label 
                  htmlFor="name" 
                  className={`text-sm font-medium ${errors.name ? 'text-destructive' : 'text-foreground'}`}
                >
                  {t('signup.name')} *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Jane Developer"
                  className={`bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 ${
                    errors.name ? 'border-destructive animate-[shake_0.3s_ease-in-out]' : ''
                  } ${formData.name && !errors.name ? 'border-primary/50 pulse-glow' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  className={`text-sm font-medium ${errors.email ? 'text-destructive' : 'text-foreground'}`}
                >
                  {t('signup.email')} *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="jane@company.com"
                  className={`bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 ${
                    errors.email ? 'border-destructive' : ''
                  } ${formData.email && !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? 'border-primary/50' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Repo URL */}
              <div className="space-y-2">
                <Label 
                  htmlFor="repoUrl"
                  className={`text-sm font-medium ${errors.repoUrl ? 'text-destructive' : 'text-foreground'}`}
                >
                  {t('signup.repo')}
                </Label>
                <Input
                  id="repoUrl"
                  type="url"
                  value={formData.repoUrl}
                  onChange={(e) => handleChange('repoUrl', e.target.value)}
                  placeholder="https://github.com/your-org/repo"
                  className={`bg-muted/50 border-border/50 focus:border-primary focus:ring-primary/20 font-mono text-sm ${
                    errors.repoUrl ? 'border-destructive' : ''
                  }`}
                />
                {errors.repoUrl && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.repoUrl}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional - helps us prepare your account
                </p>
              </div>

              {/* Use Case */}
              <div className="space-y-2">
                <Label htmlFor="useCase" className="text-sm font-medium text-foreground">
                  {t('signup.usecase')}
                </Label>
                <Select onValueChange={(value) => handleChange('useCase', value)}>
                  <SelectTrigger className="bg-muted/50 border-border/50 focus:ring-primary/20">
                    <SelectValue placeholder="Select a use case" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-border/50">
                    {useCases.map((uc) => (
                      <SelectItem key={uc.value} value={uc.value}>
                        {uc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-glow h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  t('signup.submit')
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
};

export default Signup;
