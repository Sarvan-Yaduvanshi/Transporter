













const STAGE_ORDER = ['CREATED', 'TAGGED', 'LOADING', 'LOADED', 'UNLOADED', 'COMPLETED'];
const STAGE_LABELS = {
  CREATED: 'Assigned', TAGGED: 'Tagged', LOADING: 'Loading',
  LOADED: 'Loaded', UNLOADED: 'Unloaded', COMPLETED: 'Completed'
};

const STATUS_BADGE = {
  Cleared: 'bg-green-100 text-green-700 border border-green-200',
  Dispute: 'bg-red-100 text-red-600 border border-red-200',
  Pending: 'bg-amber-100 text-amber-700 border border-amber-200',
  'In Transit': 'bg-amber-600 text-white',
  Completed: 'bg-green-600 text-white',
  Active: 'bg-amber-600 text-white'
};

function formatINR(n) {return n.toLocaleString('en-IN');}
function formatDate(d) {return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });}
function formatTime(d) {return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });}

// ...rest of the code...
export {};