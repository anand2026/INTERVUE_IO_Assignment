import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './PollResults.css';

const COLORS = ['#7765DA', '#5767D0', '#4F0DCE', '#9333EA'];

export const PollResults = ({ results }) => {
    if (!results) return null;

    const chartData = results.options.map((option, index) => ({
        name: option,
        votes: results.votes[index],
        percentage: results.votes[index] > 0
            ? ((results.votes[index] / results.answeredCount) * 100).toFixed(1)
            : 0
    }));

    const maxVotes = Math.max(...results.votes);

    return (
        <div className="poll-results">
            <div className="poll-results__header">
                <h3 className="poll-results__title">Poll Results</h3>
                <p className="poll-results__subtitle">
                    {results.answeredCount} of {results.totalStudents} students answered
                </p>
            </div>

            <div className="poll-results__chart">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6E6E6E', fontSize: 12 }}
                            tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                        />
                        <YAxis tick={{ fill: '#6E6E6E', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{
                                background: 'white',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '12px'
                            }}
                            formatter={(value) => [`${value} votes`, '']}
                        />
                        <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="poll-results__details">
                {chartData.map((item, index) => (
                    <div key={index} className="poll-results__item">
                        <div className="poll-results__item-header">
                            <span
                                className="poll-results__item-color"
                                style={{ background: COLORS[index % COLORS.length] }}
                            />
                            <span className="poll-results__item-name">{item.name}</span>
                        </div>
                        <div className="poll-results__item-stats">
                            <span className="poll-results__item-votes">{item.votes} votes</span>
                            <span className="poll-results__item-percentage">({item.percentage}%)</span>
                        </div>
                    </div>
                ))}
            </div>

            {results.studentAnswers && results.studentAnswers.length > 0 && (
                <div className="poll-results__students">
                    <h4 className="poll-results__students-title">Student Responses</h4>
                    <div className="poll-results__students-list">
                        {results.studentAnswers.map((student, index) => (
                            <div key={index} className="poll-results__student">
                                <span className="poll-results__student-name">{student.name}</span>
                                <span className="poll-results__student-answer">{student.answer}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
