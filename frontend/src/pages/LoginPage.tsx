import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Use auth hook
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const result = await response.json();
            login(result.access_token, result.refresh_token);
            navigate('/app/dashboard');
        } catch (error) {
            setError('root', {
                message: 'Invalid email or password'
            });
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Log in to continue learning</p>
                </div>

                <Card className="shadow-xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="name@example.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <div className="text-right mt-1">
                                <a href="#" className="text-sm text-blue-500 hover:text-blue-600">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

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
                            {isSubmitting ? 'Logging in...' : 'Log In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        No account?{' '}
                        <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
                            Sign up
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};
