import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    terms: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormValues) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.detail || 'Signup failed');
            }

            const result = await response.json();
            login(result.access_token, result.refresh_token);
            navigate('/app/dashboard');
        } catch (error: any) {
            setError('root', {
                message: error.message || 'Registration failed'
            });
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500">Start your journey to financial freedom</p>
                </div>

                <Card className="shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Name"
                            placeholder="John Doe"
                            error={errors.name?.message}
                            {...register('name')}
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••"
                            error={errors.password?.message}
                            {...register('password')}
                        />

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="terms"
                                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                {...register('terms')}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 leading-tight">
                                I agree to the <a href="#" className="text-blue-500 hover:text-blue-600">Terms of Service</a> and <a href="#" className="text-blue-500 hover:text-blue-600">Privacy Policy</a>
                            </label>
                        </div>
                        {errors.terms && (
                            <p className="text-sm text-red-500 animate-fade-in">{errors.terms.message}</p>
                        )}

                        {errors.root && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center animate-fade-in">
                                {errors.root.message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating account...' : 'Start Learning'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                            Log In
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
