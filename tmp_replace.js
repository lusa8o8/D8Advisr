const fs = require('fs');
const path = 'src/app/(main)/plans/page.tsx';
let data = fs.readFileSync(path, 'utf8');
const oldBlock =         {!plans?.length ? (
          <div className= rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-6 text-center>
            <p className=text-lg font-semibold text-[#222222]>
              No plans yet — tap ? Surprise Me to generate one!
            </p>
            <Link
              href=/plans/generate
              className=mt-4 inline-flex rounded-2xl bg-[#FF5A5F] px-6 py-3 text-sm font-semibold text-white
            >
              Surprise Me
            </Link>
          </div>
        ) : (;
const newBlock =         {!plans?.length ? (
          <div className=flex flex-col items-center justify-center py-20 text-center>
            <div className=text-6xl mb-4>??</div>
            <h2 className=text-xl font-bold text-gray-900 mb-2>No plans yet</h2>
            <p className=text-sm text-gray-500 mb-6>Generate your first plan to get started</p>
            <Link
              href=/plans/generate
              className=bg-[#FF5A5F] text-white px-6 py-3 rounded-full font-semibold text-sm
            >
              Build a Plan
            </Link>
          </div>
        ) : (;
if (!data.includes(oldBlock)) {
  throw new Error('old block not found');
}
data = data.replace(oldBlock, newBlock);
fs.writeFileSync(path, data);
