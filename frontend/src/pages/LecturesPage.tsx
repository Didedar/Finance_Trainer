import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { LiquidLoader } from '../components/ui/LiquidLoader';
import { client } from '../api/client';

export const LecturesPage: React.FC = () => {
    const navigate = useNavigate();
    const [structure, setStructure] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await client.get('/lessons');
                setStructure(response.data);
            } catch (error) {
                console.error('Failed to fetch lessons:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, []);

    if (isLoading) {
        return (
            <LiquidLoader
                message="Loading curriculum..."
                subtext="Preparing your learning path"
                size="md"
            />
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Curriculum</h1>

            <div className="space-y-8">
                {structure?.levels?.map((level: any) => (
                    <div key={level.level_number}>
                        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${level.is_locked ? 'text-gray-400' : 'text-gray-900'}`}>
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                                ${level.is_locked ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
                                {level.is_locked ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                ) : level.level_number}
                            </span>
                            {level.level_title}
                            {level.is_locked && <span className="text-sm font-normal ml-2 text-gray-400">(Complete previous level to unlock)</span>}
                        </h2>

                        <div className={`space-y-4 pl-4 border-l-2 border-gray-100 ml-4 transition-opacity duration-300 ${level.is_locked ? 'opacity-50 pointer-events-none select-none grayscale' : ''}`}>
                            {level.modules.map((module: any) => {
                                const allLessonsCompleted = module.lessons.length > 0 &&
                                    module.lessons.every((lesson: any) => lesson.is_completed);

                                return (
                                    <Card key={module.module_number} className={`!p-0 overflow-hidden transition-all duration-300 ${allLessonsCompleted ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
                                        <div className={`px-6 py-4 border-b transition-colors duration-300 ${allLessonsCompleted ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                            <h3 className={`font-semibold flex items-center gap-2 ${allLessonsCompleted ? 'text-green-700' : 'text-gray-800'}`}>
                                                {allLessonsCompleted && (
                                                    <span className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                )}
                                                {module.module_title}
                                                {allLessonsCompleted && (
                                                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                                        Completed
                                                    </span>
                                                )}
                                            </h3>
                                        </div>

                                        <div className="divide-y divide-gray-100">
                                            {module.lessons.map((lesson: any) => (
                                                <div
                                                    key={lesson.id}
                                                    className="p-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between cursor-pointer group"
                                                    onClick={() => !level.is_locked && navigate(`/app/lessons/${lesson.id}`)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full ${lesson.is_completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <span className={`${lesson.is_completed ? 'text-gray-500' : 'text-gray-700 font-medium'} group-hover:text-blue-600 transition-colors`}>
                                                            {lesson.title}
                                                        </span>
                                                    </div>

                                                    {lesson.is_completed ? (
                                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">Completed</span>
                                                    ) : (
                                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
