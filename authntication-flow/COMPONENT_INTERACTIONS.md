# Component Interaction & Data Flow Guide

## 📊 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LoginPage (page.tsx)                     │
│                 (Orchestration Layer)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ AuthHeader   │ │ LoginForm    │ │ SocialLogin  │
        │ (Display)    │ │ (Stateful)   │ │ (Display)    │
        └──────────────┘ │              │ └──────────────┘
                         │ State: form  │
                         │ - email      │
                         │ - password   │
                         │ - rememberMe │
                         └──────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
            ┌────────┐   ┌──────────┐  ┌──────────┐
            │ Input  │   │ Password │  │Checkbox  │
            │        │   │ Input    │  │          │
            └────────┘   └──────────┘  └──────────┘
                │             │
                └─────────────┴────────┐
                                       ▼
                                   ┌────────┐
                                   │ Button │
                                   │(Submit)│
                                   └────────┘
```

---

## 🔄 State Management Flow

### LoginForm Component State

```
Initial State:
┌──────────────────────────────────────┐
│ formData = {                         │
│   email: '',                         │
│   password: '',                      │
│   rememberMe: false                  │
│ }                                    │
└──────────────────────────────────────┘
         ↓
    User Types Email
         ↓
onChange event fires
         ↓
setFormData updates state
         ↓
Component re-renders
         ↓
┌──────────────────────────────────────┐
│ formData = {                         │
│   email: 'user@example.com',         │
│   password: '',                      │
│   rememberMe: false                  │
│ }                                    │
└──────────────────────────────────────┘
```

---

## 🎯 Component Props & Usage

### AuthHeader
```tsx
// Props
interface AuthHeaderProps {
  title?: string;           // "Welcome Back!"
  subtitle?: string;        // "Please enter log in details below"
  logoSrc?: string;         // "/logo.svg"
  logoAlt?: string;         // "Daily Logo"
  logoWidth?: number;       // 35
  logoHeight?: number;      // 35
}

// Usage
<AuthHeader
  title="Welcome Back!"
  subtitle="Please enter log in details below"
  logoSrc="/logo.svg"
  logoAlt="Daily Logo"
/>

// Output
<div>
  <div className="mb-10 flex items-center gap-2">
    <Image src="/logo.svg" ... />
    <span>DAILY</span>
  </div>
  <h2>Welcome Back!</h2>
  <p>Please enter log in details below</p>
</div>
```

### LoginForm
```tsx
// Props
interface LoginFormProps {} // No props - manages its own state

// Internal State
const [formData, setFormData] = useState({
  email: '',
  password: '',
  rememberMe: false,
});

// Usage
<LoginForm />

// Output
<form onSubmit={handleSubmit}>
  <Input ... email />
  <PasswordInput ... password />
  <Checkbox ... rememberMe />
  <Button type="submit" ... />
</form>
```

### Input Component
```tsx
// Props
interface InputProps {
  type?: string;
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

// Usage in LoginForm
<Input
  type="email"
  name="email"
  label="Email"
  placeholder="Enter your mail"
  value={formData.email}
  onChange={handleInputChange}
  required
/>

// Data Flow
User types → onChange fires → formData.email updated → Component re-renders with new value
```

### PasswordInput Component
```tsx
// Props (same as Input + internal state for visibility)
interface PasswordInputProps {
  // ... same as Input
}

// Internal State
const [isVisible, setIsVisible] = useState(false);

// Usage
<PasswordInput
  name="password"
  label="Password"
  placeholder="Enter your password"
  value={formData.password}
  onChange={handleInputChange}
  required
/>

// Features
- Shows/hides password on eye icon click
- Internally manages visibility state
- Passes value back to parent via onChange
```

### Button Component
```tsx
// Props
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

// Usage
<Button type="submit" variant="primary" fullWidth>
  Log in
</Button>

// Variants
Primary  : bg-teal-800 text-white
Secondary: bg-slate-200 text-slate-800
Outline  : border border-slate-300 text-slate-800
```

### Checkbox Component
```tsx
// Props
interface CheckboxProps {
  label?: string;
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

// Usage in LoginForm
<Checkbox
  name="rememberMe"
  label="Remember me"
  checked={formData.rememberMe}
  onChange={handleInputChange}
/>

// Data Flow
User clicks → onChange fires → formData.rememberMe toggled → Component re-renders
```

### SocialLogin
```tsx
// Props
interface SocialLoginProps {} // No props

// Usage
<SocialLogin />

// Output
<>
  <div><!-- divider --></div>
  <div>
    <Button variant="outline">Google</Button>
    <Button variant="outline">Facebook</Button>
  </div>
</>
```

### AuthFooter
```tsx
// Props
interface AuthFooterProps {
  message?: string;       // "Don't have an account?"
  linkText?: string;      // "Sign Up"
  linkHref?: string;      // "/signup"
}

// Usage
<AuthFooter
  message="Don't have an account?"
  linkText="Sign Up"
  linkHref="/signup"
/>

// Output
<p>
  Don't have an account?{' '}
  <a href="/signup">Sign Up</a>
</p>
```

---

## 🔀 Event Flow Example: User Submits Form

```
1. User Clicks Submit Button
   ↓
2. Button onClick → Form onSubmit handler
   ↓
3. handleSubmit(e) executes
   - e.preventDefault() stops page reload
   ↓
4. Access formData from state
   {
     email: 'user@example.com',
     password: 'password123',
     rememberMe: true
   }
   ↓
5. Send to API / Handle Login
   - console.log('Form submitted:', formData)
   - Could call: await fetch('/api/login', { ... })
   ↓
6. Handle Response
   - Success: Redirect to dashboard
   - Error: Show error message
```

---

## 🔗 Component Composition Pattern

### Single Form Page
```tsx
<Page>
  <AuthHeader />
  <LoginForm />     ← Contains Input, PasswordInput, Button, Checkbox
  <SocialLogin />
  <AuthFooter />
</Page>
```

### Multiple Forms (Signup + Login)
```tsx
<Page>
  <AuthHeader /> ← Same component
  
  {isSignup ? (
    <SignupForm />  ← Uses Input, PasswordInput, Button
  ) : (
    <LoginForm /> ← Uses Input, PasswordInput, Button, Checkbox
  )}
  
  <SocialLogin /> ← Same component
  <AuthFooter /> ← Same component
</Page>
```

### Custom Form
```tsx
'use client';

import { Input, Button } from '@/components/ui';

export function CustomForm() {
  const [data, setData] = useState({ ... });
  
  return (
    <form>
      <Input
        label="Field 1"
        value={data.field1}
        onChange={(e) => setData({...data, field1: e.target.value})}
      />
      <Input
        label="Field 2"
        value={data.field2}
        onChange={(e) => setData({...data, field2: e.target.value})}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

---

## 💾 Data Updates Flow

```
UI Input Element
        ↓
onChange event listener
        ↓
handleInputChange executes
        ↓
Event object contains:
  - name: 'email'
  - value: 'new value'
  - type: 'text' | 'checkbox'
  - checked: true/false (for checkbox)
        ↓
setFormData updates state:
  {
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }
        ↓
React detects state change
        ↓
Component re-renders with new value
        ↓
Input/Checkbox displays updated value
```

---

## 🎛️ Variant System Example (Button)

```tsx
// Define variants
const variantStyles = {
  primary: 'bg-teal-800 hover:bg-teal-900 text-white focus:ring-teal-600',
  secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500',
  outline: 'border border-slate-300 hover:bg-slate-50 text-slate-800 focus:ring-slate-400',
};

// Usage
<Button variant="primary" fullWidth>Primary Button</Button>
<Button variant="secondary" fullWidth>Secondary Button</Button>
<Button variant="outline" fullWidth>Outline Button</Button>

// Classes Applied
primary: bg-teal-800 hover:bg-teal-900 text-white ... w-full
secondary: bg-slate-200 hover:bg-slate-300 text-slate-800 ... w-full
outline: border border-slate-300 hover:bg-slate-50 text-slate-800 ... w-full
```

---

## 🚀 How to Extend Components

### Add Password Strength Indicator
```tsx
export const PasswordInput: React.FC<PasswordInputProps> = ({ ... }) => {
  // ... existing code
  
  // Add strength calculation
  const getStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)) {
      return 'strong';
    }
    return 'medium';
  };
  
  return (
    <div>
      {/* existing password input */}
      {value && (
        <div className={`mt-2 h-1 ${getStrength(value) === 'weak' ? 'bg-red-500' : 'bg-green-500'}`} />
      )}
    </div>
  );
};
```

### Add Form Error Handling
```tsx
export const LoginForm: React.FC = () => {
  const [errors, setErrors] = useState({});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.password) newErrors.password = 'Password required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit
  };
  
  return (
    <form>
      <Input {...} />
      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      {/* ... */}
    </form>
  );
};
```

---

**This component structure provides maximum reusability and maintainability!** ✨
