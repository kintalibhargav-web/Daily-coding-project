window.CodeDojoData = (() => {
  const PTS = { Easy: 10, Medium: 20, Hard: 30 };
  const AVATARS = ["🦁", "🥷", "💥", "🐉", "🦊", "🚀", "🧠", "⚡"];
  const QUOTES = [
    "One problem a day keeps the rejection letters away.",
    "Your streak is a promise you keep to your future self.",
    "Wrong Answer is just the compiler teaching you something.",
    "Small steps every day. Placements are won in the quiet hours.",
    "Your squad is counting on one more solve. You’ve got this.",
    "Every expert once stared at Two Sum for an hour.",
    "Don’t break the chain: one accepted solution keeps it alive.",
    "Slow progress is still progress. Run the tests again."
  ];
  const BELTS = [["White", 0, "#d8dbf5"], ["Yellow", 30, "#ffd23f"], ["Orange", 80, "#ff9a3c"], ["Green", 150, "#3ddc97"], ["Blue", 260, "#5b8cff"], ["Brown", 400, "#a9744f"], ["Black", 600, "#262a44"]];
  function belt(sc) {
    let i = 0;
    BELTS.forEach((b, j) => { if (sc >= b[1]) i = j; });
    const c = BELTS[i], n = BELTS[i + 1];
    return { name: c[0], col: c[2], next: n && n[0], need: n ? n[1] - sc : 0, pct: n ? Math.round((sc - c[1]) / (n[1] - c[1]) * 100) : 100 };
  }
  const mk = (id, title, difficulty, tags, statement, constraints, fn, pyFn, params, tests, hint) => ({ id, title, difficulty, tags, statement, constraints, fn, pyFn, params, tests, hint });
  const PROBLEMS = [
    mk(1,"Two Sum Variant","Easy",["Arrays","Hash Maps"],"Given an array of integers nums and an integer target, return the indices [i, j] (i < j) of the two numbers that add up to target. Exactly one solution exists.",["2 <= nums.length <= 10^4","Exactly one valid pair exists"],"twoSum","two_sum",["nums","target"],[{args:[[2,7,11,15],9],expected:[0,1]},{args:[[3,2,4],6],expected:[1,2]},{args:[[3,3],6],expected:[0,1]},{args:[[1,5,8,3],11],expected:[2,3]},{args:[[-1,-2,-3,-4,-5],-8],expected:[2,4]}],"Instead of checking every pair, remember each number you’ve already seen along with its index."),
    mk(2,"Valid Palindrome","Easy",["Strings","Two Pointers"],"Return true if s reads the same forwards and backwards after removing non-alphanumeric characters and ignoring case.",["0 <= s.length <= 2 * 10^5"],"isPalindrome","is_palindrome",["s"],[{args:["A man, a plan, a canal: Panama"],expected:true},{args:["race a car"],expected:false},{args:[" "],expected:true},{args:["0P"],expected:false},{args:["No lemon, no melon"],expected:true}],"Place one pointer at each end and move them inward, skipping characters that don’t matter."),
    mk(3,"Maximum Subarray","Medium",["Arrays","Dynamic Programming"],"Find the contiguous subarray with the largest sum and return that sum.",["1 <= nums.length <= 10^5"],"maxSubArray","max_sub_array",["nums"],[{args:[[-2,1,-3,4,-1,2,1,-5,4]],expected:6},{args:[[1]],expected:1},{args:[[5,4,-1,7,8]],expected:23},{args:[[-3,-2,-1]],expected:-1},{args:[[2,-1,2,-1,2]],expected:4}],"At each position, decide: extend the running subarray or start fresh here?"),
    mk(4,"Climbing Stairs","Easy",["Dynamic Programming","Math"],"You can climb 1 or 2 steps at a time. Return the number of distinct ways to reach step n.",["1 <= n <= 45"],"climbStairs","climb_stairs",["n"],[{args:[1],expected:1},{args:[2],expected:2},{args:[3],expected:3},{args:[5],expected:8},{args:[10],expected:89}],"The ways to reach step n depend only on the previous two steps."),
    mk(5,"Valid Anagram","Easy",["Strings","Hash Maps"],"Return true if t is an anagram of s (same letters, same counts).",["1 <= s.length, t.length <= 5 * 10^4"],"isAnagram","is_anagram",["s","t"],[{args:["anagram","nagaram"],expected:true},{args:["rat","car"],expected:false},{args:["a","a"],expected:true},{args:["listen","silent"],expected:true},{args:["ab","a"],expected:false}],"Count how many times each character appears."),
    mk(6,"Best Time to Buy and Sell Stock","Easy",["Arrays","Greedy"],"prices[i] is the price on day i. Buy once, sell later once. Return the maximum profit (0 if none).",["1 <= prices.length <= 10^5"],"maxProfit","max_profit",["prices"],[{args:[[7,1,5,3,6,4]],expected:5},{args:[[7,6,4,3,1]],expected:0},{args:[[1,2]],expected:1},{args:[[2,4,1]],expected:2},{args:[[3,2,6,5,0,3]],expected:4}],"Track the cheapest price seen so far as you scan once."),
    mk(7,"Container With Most Water","Medium",["Arrays","Two Pointers","Greedy"],"height[i] is a vertical line at position i. Choose two lines that, with the x-axis, hold the most water. Return that area.",["2 <= height.length <= 10^5"],"maxArea","max_area",["height"],[{args:[[1,8,6,2,5,4,8,3,7]],expected:49},{args:[[1,1]],expected:1},{args:[[4,3,2,1,4]],expected:16},{args:[[1,2,1]],expected:2},{args:[[2,3,4,5,18,17,6]],expected:17}],"Start with the widest container. Which pointer is worth moving?"),
    mk(8,"Longest Substring Without Repeating Characters","Medium",["Strings","Hash Maps","Sliding Window"],"Return the length of the longest substring of s with no repeated characters.",["0 <= s.length <= 5 * 10^4"],"lengthOfLongestSubstring","length_of_longest_substring",["s"],[{args:["abcabcbb"],expected:3},{args:["bbbbb"],expected:1},{args:["pwwkew"],expected:3},{args:[""],expected:0},{args:["dvdf"],expected:3}],"Keep a window and shrink it from the left whenever a duplicate appears."),
    mk(9,"Coin Change","Hard",["Dynamic Programming"],"Given coin denominations and an amount, return the fewest coins needed to make that amount, or -1 if impossible.",["1 <= coins.length <= 12","0 <= amount <= 10^4"],"coinChange","coin_change",["coins","amount"],[{args:[[1,2,5],11],expected:3},{args:[[2],3],expected:-1},{args:[[1],0],expected:0},{args:[[1,3,4],6],expected:2},{args:[[2,5,10,1],27],expected:4}],"Build the answer for every amount from 0 up to the target, reusing smaller answers."),
    mk(10,"Jump Game","Medium",["Arrays","Greedy"],"nums[i] is the max jump length from index i. Starting at index 0, return true if you can reach the last index.",["1 <= nums.length <= 10^4"],"canJump","can_jump",["nums"],[{args:[[2,3,1,1,4]],expected:true},{args:[[3,2,1,0,4]],expected:false},{args:[[0]],expected:true},{args:[[2,0,0]],expected:true},{args:[[1,0,1]],expected:false}],"Track the furthest index you can reach as you walk through the array."),
    mk(11,"House Robber","Medium",["Dynamic Programming","Arrays"],"nums[i] is the money in house i. You can’t rob two adjacent houses. Return the maximum you can rob.",["1 <= nums.length <= 100"],"rob","rob",["nums"],[{args:[[1,2,3,1]],expected:4},{args:[[2,7,9,3,1]],expected:12},{args:[[5]],expected:5},{args:[[2,1,1,2]],expected:4},{args:[[10,1,1,10]],expected:20}],"At each house: take it plus the best from two houses back, or skip it."),
    mk(12,"Contains Duplicate","Easy",["Arrays","Hash Maps"],"Return true if any value appears at least twice in the array.",["0 <= nums.length <= 10^5"],"containsDuplicate","contains_duplicate",["nums"],[{args:[[1,2,3,1]],expected:true},{args:[[1,2,3,4]],expected:false},{args:[[]],expected:false},{args:[[5,5]],expected:true},{args:[[0,-1,-2,0]],expected:true}],"A set remembers what you’ve already seen.")
  ];
  const PUBLIC_TESTS = 3;
  const seedTeams = () => [{id:"t1",name:"Stack Smashers",avatar:"💥",members:[{name:"Aarav",score:50,streak:2},{name:"Diya",score:40,streak:1},{name:"Rohan",score:30,streak:1}]},{id:"t2",name:"Code Ninjas",avatar:"🥷",members:[{name:"Sneha",score:40,streak:1},{name:"Vikram",score:30,streak:1},{name:"Anya",score:20,streak:0}]},{id:"t3",name:"Binary Beasts",avatar:"🦁",members:[{name:"Ishaan",score:20,streak:1},{name:"Meera",score:30,streak:1},{name:"Kabir",score:10,streak:0}]}];
  return Object.freeze({ PTS, AVATARS, QUOTES, belt, PROBLEMS, PUBLIC_TESTS, seedTeams });
})();
