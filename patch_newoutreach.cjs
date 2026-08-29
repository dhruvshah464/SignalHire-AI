const fs = require('fs');
let content = fs.readFileSync('src/pages/NewOutreach.tsx', 'utf-8');

const targetStr = `                {(outreachResult?.improvementSuggestions?.length > 0) && (
                   <div className="p-6 rounded-2xl border bg-blue-50 border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Lightbulb className="w-6 h-6 text-blue-600" />
                      <h4 className="font-bold text-slate-900">Quick Fixes</h4>
                    </div>
                    <ul className="space-y-2">
                       {outreachResult.improvementSuggestions.slice(0, 3).map((s: string, i: number) => (
                         <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1 shrink-0"></span>
                           {s}
                         </li>
                       ))}
                    </ul>
                   </div>
                )}`;

const replaceStr = targetStr + `\n
                {outreachResult?.search_insights && (
                   <div className="p-6 rounded-2xl border bg-purple-50 border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                      <h4 className="font-bold text-slate-900">Search Insights</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {outreachResult.search_insights}
                    </p>
                   </div>
                )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('src/pages/NewOutreach.tsx', content);
  console.log("Patched NewOutreach.tsx");
} else {
  console.log("Could not find target block in NewOutreach.tsx");
}
