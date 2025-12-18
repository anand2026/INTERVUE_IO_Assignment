import React from 'react';
import './PollResults.css';

const COLORS = ['#7765DA', '#5767D0', '#4F0DCE', '#9333EA'];

export const PollResults = ({ results, isTeacher = false }) => {
    if (!results) return null;

    const chartData = results.options.map((option, index) => {
        const voteCount = results.votes ? results.votes[index] : 0;
        // Calculate percentage based on total votes to prevent incorrect percentages
        const totalVotes = results.votes ? results.votes.reduce((a, b) => a + b, 0) : 0;

        return {
            name: option,
            votes: voteCount,
            percentage: totalVotes > 0
                ? ((voteCount / totalVotes) * 100).toFixed(1)
                : 0
        };
    });

    return (
        <div className="poll-results">
            <div className="poll-results__header">
                <h3 className="poll-results__title">Poll Results</h3>
                <p className="poll-results__subtitle">
                    {results.answeredCount} of {results.totalStudents} students answered
                </p>
            </div>

            <div className="poll-results__horizontal-bars">
                {chartData.map((item, index) => (
                    <div key={index} className="poll-results__bar-item">
                        <div className="poll-results__bar-label">
                            <span className="poll-results__option-circle" style={{ background: COLORS[index % COLORS.length] }}>
                                {index + 1}
                            </span>
                            <span className="poll-results__option-text">{item.name}</span>
                        </div>
                        <div className="poll-results__bar-container">
                            <div
                                className="poll-results__bar-fill"
                                style={{
                                    width: `${item.percentage}%`,
                                    background: COLORS[index % COLORS.length]
                                }}
                            />
                        </div>
                        <span className="poll-results__percentage">{item.percentage}%</span>
                    </div>
                ))}
            </div>

            {isTeacher && results.studentAnswers && results.studentAnswers.length > 0 && (
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
