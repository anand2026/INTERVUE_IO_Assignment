import React from 'react';
import './PollResults.css';

const CIRCLE_COLOR = '#7765DA';
const BAR_COLOR = '#6766D5';

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
            <div className="poll-results__horizontal-bars">
                {chartData.map((item, index) => (
                    <div key={index} className="poll-results__bar-item">
                        <div className="poll-results__bar-container">
                            <div
                                className="poll-results__bar-fill"
                                style={{
                                    width: `${item.percentage}%`,
                                    background: BAR_COLOR
                                }}
                            />
                        </div>
                        <div className="poll-results__bar-content">
                            <div className="poll-results__bar-left">
                                <span className="poll-results__option-circle" style={{ background: CIRCLE_COLOR }}>
                                    {index + 1}
                                </span>
                                <span className="poll-results__option-text">{item.name}</span>
                            </div>
                            <span className="poll-results__percentage">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
