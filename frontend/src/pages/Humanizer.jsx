import React, { useState } from 'react';
import { textService } from '../services/api';
import toast from 'react-hot-toast';
import { SparklesIcon, DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const Humanizer = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState('casual');
  const [charCount, setCharCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(null);

  const tones = [
    { id: 'casual', name: 'Casual', desc: 'Everyday conversation', style: '😊 Friendly & Relaxed' },
    { id: 'professional', name: 'Professional', desc: 'Business formal', style: '💼 Corporate & Polished' },
    { id: 'friendly', name: 'Friendly', desc: 'Warm & approachable', style: '🤗 Kind & Welcoming' },
    { id: 'academic', name: 'Academic', desc: 'Scholarly', style: '📚 Research & Formal' },
    { id: 'student', name: 'Student', desc: 'Learning & clear', style: '🎓 Educational & Simple' },
    { id: 'creative', name: 'Creative', desc: 'Artistic & expressive', style: '🎨 Imaginative & Unique' },
    { id: 'technical', name: 'Technical', desc: 'Precise & detailed', style: '⚙️ Accurate & Specific' },
    { id: 'persuasive', name: 'Persuasive', desc: 'Convincing & compelling', style: '🎯 Influential & Strong' },
  ];

  const handleTextChange = (e) => {
    setText(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleHumanize = async () => {
    if (text.length < 10) {
      toast.error('Please enter at least 10 characters');
      return;
    }

    setLoading(true);
    setProcessingTime(null);
    
    const startTime = performance.now();
    
    try {
      const response = await textService.humanizeText(text, tone);
      const endTime = performance.now();
      setProcessingTime((endTime - startTime).toFixed(0));
      
      setResult(response);
      toast.success(`Text humanized with ${tone} tone!`);
    } catch (error) {
      console.error('Humanization failed:', error);
      toast.error(error.message || 'Failed to humanize text. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setCharCount(0);
    setProcessingTime(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-green-500';
    return 'text-green-600';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Still appears AI-generated';
    if (score >= 60) return 'Moderately human-like';
    if (score >= 40) return 'Mixed signals';
    if (score >= 20) return 'Very human-like';
    return 'Excellent! Sounds completely human';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">AI Text Humanizer</h1>
        <p className="text-gray-600 mt-2">Make AI text sound natural and human-like</p>
      </div>

      {!result ? (
        <>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-700">
                Select Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {tones.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      tone === t.id
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
                    <div className="text-xs text-primary-600 mt-1">{t.style}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Your Text
              </label>
              <textarea
                rows="8"
                className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
                placeholder="Enter AI-generated text to humanize... (e.g., ChatGPT, Claude, Gemini output)"
                value={text}
                onChange={handleTextChange}
                disabled={loading}
              />
            </div>

            <div className="flex justify-between items-center mt-3 text-sm">
              <div className="flex space-x-4">
                <span className="text-gray-500">
                  📝 {charCount} characters
                </span>
                <span className="text-gray-500">
                  📊 ~{Math.ceil(charCount / 5)} words
                </span>
              </div>
              <span className={charCount < 10 ? 'text-red-500' : 'text-green-600 font-medium'}>
                {charCount < 10 ? '⚠️ Min 10 chars required' : '✓ Ready to humanize'}
              </span>
            </div>

            <button
              onClick={handleHumanize}
              disabled={loading || text.length < 10}
              className="btn-primary w-full mt-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Humanizing your text...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5 mr-2" />
                  Humanize Text
                </>
              )}
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">✨ Pro Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Longer texts (100+ words) produce better results</li>
              <li>• Try different tones to find the perfect style</li>
              <li>• Results are processed with Google's Gemini AI</li>
              <li>• The AI score shows how human-like the result sounds</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">✨ Humanized Result</h2>
              <button 
                onClick={handleReset} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Humanize New Text →
              </button>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-5 mb-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {result.processedText}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleCopy(result.processedText)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                Copy
              </button>
            </div>

            <div className="border-t mt-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">AI Score After</p>
                  <p className={`text-2xl font-bold ${getScoreColor(result.aiScore)}`}>
                    {result.aiScore}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getScoreMessage(result.aiScore)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">Tone Used</p>
                  <p className="text-xl font-bold capitalize text-gray-800">
                    {tones.find(t => t.id === tone)?.name || tone}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tones.find(t => t.id === tone)?.style || ''}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">Processing Time</p>
                  <p className="text-xl font-bold text-gray-800">
                    {processingTime || '—'} ms
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {processingTime && parseFloat(processingTime) < 2000 ? '⚡ Fast' : '🔄 Processing'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-500">Character Count</p>
                  <p className="text-xl font-bold text-gray-800">
                    {result.processedText?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.ceil((result.processedText?.length || 0) / 5)} words
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="font-medium mb-3 text-gray-700 flex items-center">
              <span className="text-lg mr-2">📄</span> Original Text
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{result.originalText}</p>
          </div>

          {result.aiScore > 60 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">💡 Try Again?</h3>
              <p className="text-sm text-yellow-700">
                The AI score is still {result.aiScore}%. Try a different tone or provide more text for better results.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Humanizer;