-- ============================================================================
-- JAMBO APPARELS - BULK BLOG POST SEED & SCHEDULER (REVISED)
-- This file seeds 19 new blog posts and schedules them for future publication.
-- The existing cron job will automatically publish these on their scheduled dates.
-- FIX: This version uses INSERT...SELECT to dynamically find the category_id,
-- preventing foreign key violations if the category already exists with a different ID.
-- ============================================================================

-- Ensure the 'Faith & Living' category exists. The ID will be handled by the DB if new.
INSERT INTO public.blog_categories (name, slug, description)
VALUES ('Faith & Living', 'faith-living', 'Living out your faith in everyday life')
ON CONFLICT (slug) DO NOTHING;

-- Insert all 19 posts, dynamically selecting the correct category_id
INSERT INTO public.blog_posts (
  title, 
  summary, 
  content, 
  slug, 
  status, 
  featured_image, 
  thumbnail, 
  author, 
  reading_time, 
  category_id,
  seo_title,
  seo_description,
  scheduled_for
)
SELECT
    v.title,
    v.summary,
    v.content,
    v.slug,
    v.status,
    v.featured_image,
    v.thumbnail,
    v.author,
    v.reading_time,
    (SELECT id FROM public.blog_categories WHERE slug = 'faith-living' LIMIT 1), -- Dynamic ID lookup
    v.seo_title,
    v.seo_description,
    v.scheduled_for
FROM (
  VALUES
    -- 1
    (
      'Stay Connected to the Church',
      'God created us to be in community with Him and other believers. Our Christian relationships enable us to develop confidence to face whatever life may throw at us.',
      '> "And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching."
> 
> **Hebrews 10:24-25**

God created us to be in community—first with Him and then with other believers. In fact, this is an important imperative. Our Christian relationships enable us to develop confidence to face whatever life may throw at us. God''s family provokes one another to do good works and provides encouragement. 

As you see the day of Christ''s coming drawing nearer, gather together more to fellowship, learn and grow with other believers.',
      'stay-connected-to-the-church', 'draft'::text,
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'The Importance of Christian Community', 'Discover why Hebrews 10 calls us to meet together and how community strengthens our faith.',
      '2026-02-06 20:37:00'::timestamptz
    ),
    -- 2
    (
      'Stay Committed to Your Faith',
      'Often during the difficult seasons of our life, God does His most profound work. If you embrace His work and ask God to teach you, you are expressing great patience.',
      '> "Be patient, then, brothers and sisters, until the Lord’s coming. See how the farmer waits for the land to yield its valuable crop, patiently waiting for the autumn and spring rains. You too, be patient and stand firm, because the Lord’s coming is near."
>
> **James 5:7-8**

Often during the difficult seasons of our life, God does His most profound work. If you embrace His work and ask God to teach you what He wants you to know, you are expressing great patience. This is no time for weak-hearted Christians, who complain and grumble in today''s world. The word of God challenges you to develop an attitude of Courage, Confidence and Firmness in the God you serve.',
      'stay-committed-to-your-faith', 'draft'::text,
      'https://images.unsplash.com/photo-1593094186357-a55d67554900?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1593094186357-a55d67554900?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'Patience and Firmness in Difficult Seasons', 'Learn from James 5 how to stand firm and be patient, trusting in Gods work during hard times.',
      '2026-02-10 20:37:00'::timestamptz
    ),
    -- 3
    (
      'Stay Confident in the Word',
      'When you find yourself carving a sure thing to cling to, you will find that the Word of God is that one Word of Truth. The more you love God''s Word, the greater your peace.',
      '> "In the presence of God and of Christ Jesus, who will judge the living and the dead, and in view of his appearing and his kingdom, I give you this charge. Preach the word; be prepared in season and out of season; correct, rebuke and encourage—with great patience and careful instruction."
>
> **2 Timothy 4:1-2**

When you find yourself craving a sure thing to cling to, you will find that the Word of God is that one Word of Truth. When you are in need of a Sure, Serious, Systematic, and Sensitive Word of encouragement, you can go to God''s Word and always be confronted. The more you love God''s Word, the greater your peace, and you have His promise that you will not stumble.',
      'stay-confident-in-the-word', 'draft'::text,
      'https://images.unsplash.com/photo-1543168256-418811576931?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1543168256-418811576931?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'Finding Your Anchor in God''s Word', 'Explore how the Bible provides a steadfast truth and unshakeable peace in a changing world.',
      '2026-02-14 20:37:00'::timestamptz
    ),
    -- 4
    (
      'Stay Calm In Your Heart and Carry On',
      'Having experienced trouble in His own life, the Lord Jesus knows that we all have trouble. He was offering a reasoned alternative: His promises of a Place, a Purpose, and a Plan.',
      '> "Do not let your hearts be troubled. You believe in God; believe also in me. My Father’s house has many rooms; if that were not so, would I have told you that I am going there to prepare a place for you. And if I go and prepare a place for you, I will come back and take you to be with me that you also may be where I am."
>
> **John 14:1-3**

Having experienced trouble in His own life, the Lord Jesus knows that we all have trouble. He was not rebuking a lack of faith when He said, "Don''t let your heart be troubled," but He was offering a reasoned alternative. Jesus promises a Place, a Purpose and a Plan all dependant on His person. Your troubled heart should be calmed by the assurance that He is able to do all that He has promised you. Your part is to confidently act on His promises.',
      'stay-calm-in-your-heart', 'draft'::text,
      'https://images.unsplash.com/photo-1499901358212-051c911a3390?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1499901358212-051c911a3390?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'How to Calm a Troubled Heart with Christ''s Promises', 'Jesus offers an alternative to a troubled heart through His promise of a place, purpose, and plan.',
      '2026-02-18 20:37:00'::timestamptz
    ),
    -- 5
    (
      'Stay Centred on Christ',
      'When everything else is out of control, set your affection on the One who is in control. Everything you put your hope in other than Jesus will fail. Jesus Christ alone is faithful.',
      '> "Since, then, you have been raised with Christ, set your hearts on things above, where Christ is, seated at the right hand of God. Set your minds on things above, not on earthly things. For you died, and your life is now hidden with Christ in God. When Christ, who is your life, appears, then you also will appear with him in glory."
>
> **Colossians 3:1-4**

There are four powerful pieces of evidence of a life centred on Jesus Christ. You are gladly identified with Christ. You recognise Jesus as the authority in your life. You have a deep sense of spiritual and personal security. And you rest in Christ knowing that He is the master of your destiny. In Christ you should live a brand-new life in a brand-new-way. When everything else is out of control, set your affection on the One who is in control. Everything you put your hope in other than Jesus will fail. Jesus Christ alone is faithful and changeless and will never fail you!',
      'stay-centred-on-christ', 'draft'::text,
      'https://images.unsplash.com/photo-1508921340878-ba53e1f416ec?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1508921340878-ba53e1f416ec?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'Four Signs of a Christ-Centered Life', 'Discover four powerful pieces of evidence of a life centered on Jesus Christ, based on Colossians 3.',
      '2026-02-22 20:37:00'::timestamptz
    ),
    -- 6
    (
      'Stay Challenged to Grow',
      'Half-hearted attempts have no place in the life of a Christian as we await Christ''s return. God wants us to grow and know him more. Don''t stop the good things you are doing but work even harder.',
      '> "And so, dear friends, while you are waiting for these things to happen, make every effort to be found living peaceful lives that are pure and blameless in his sight."
>
> **2 Peter 3:14**

In sports, the arts, and all of life the road to success is paved with diligence. Strenuous effort produces far more than talent alone can do. This applies to our Christian walk too. Half-hearted attempts have no place in the life of a Christian as we await Christ''s return. You need NOT to sit idle. God wants us to grow and know him more. Don''t stop the good things you are doing but work even harder. If you stay challenged to learn more, grow in grace and be more effective for the kingdom, the world will have difficulty distracting you from your eternal hope.',
      'stay-challenged-to-grow', 'draft'::text,
      'https://images.unsplash.com/photo-1533035336122-4327d347d278?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1533035336122-4327d347d278?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'The Christian Call to Diligent Growth', 'Explore why half-hearted attempts have no place in the Christian life and how to stay challenged to grow.',
      '2026-02-26 20:37:00'::timestamptz
    ),
    -- 7
    (
      'The Heart of Compassion',
      'Often our disappointments and fears cause us to become self-centred. God is full of compassion, and He is willing to develop that same compassion in your heart.',
      '> "Finally, all of you should be of one mind. Sympathize with each other. Love each other as brothers and sisters. Be tender-hearted, and keep a humble attitude. Do not repay evil for evil or reviling for reviling, but on the contrary, bless, for to this you were called, that you may obtain a blessing."
>
> **1 Peter 3:8-9**

Often our disappointments and fears cause us to become self-centred and demanding people when our real need is to become more loving and compassionate towards one another.

God is always at work in our disappointments and brokenness. He is full of compassion, and He is willing to develop that same compassion in your heart and enable you to ''be Jesus'' to those who desperately need Him.',
      'the-heart-of-compassion', 'draft'::text,
      'https://images.unsplash.com/photo-1588072432836-e10032774350?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&h=300&fit=crop',
      'David Jeremiah', 2,
      'Developing a Tender and Humble Heart', 'Learn how God develops compassion in our hearts, even through disappointment and brokenness.',
      '2026-03-02 20:37:00'::timestamptz
    ),
    -- 8
    (
      'The Blessed Gift of Waiting on the Lord',
      'Waiting is not a chore God makes us do, but a blessed gift that points us to Him who satisfies. In our seasons of waiting, we can intimately know the God who is always on time.',
      '> "For God alone my soul waits in silence; from him comes my salvation. He alone is my rock and my salvation, my fortress; I shall not be greatly shaken."
>
> **Psalm 62:1–2**

In my human limitation I used to think waiting was a chore, something God made me do instead of what He has really enabled me to do as His child. As I have continued to study the Scripture, I have come to learn a few things about waiting. 

It is not a task that is forced upon us rather it is a blessed gift that points us to Him who satisfies. For years I believed the devil''s lie that children, a well-paying job, and such things would satisfy the wait within me. Instead, all these things revealed to me that we will always be in a season of waiting. In that understanding I have made a deliberate choice to use the moment to intimately know the God who is on time always.

Waiting really is about Jesus and this is woven throughout Scripture. The Israelites waited, Abraham and Sarah waited, Joseph waited, Moses waited, Mary waited. All of them waited, and in their tarrying God showed up with His steadfast love and his unwavering promises!

Are you in season of waiting? Do not sit in idleness; serve the Lord right where you are. Seek his face. Obey his Word. Nothing and no one can satisfy your heart like Jesus can.',
      'the-gift-of-waiting-on-the-lord', 'draft'::text,
      'https://images.unsplash.com/photo-1533130099154-0aa19b0253c2?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1533130099154-0aa19b0253c2?w=400&h=300&fit=crop',
      'Jambo Apparels', 3,
      'How to Find Purpose in Seasons of Waiting', 'Reframing our perspective on waiting as a gift that draws us closer to God and His promises.',
      '2026-03-06 20:37:00'::timestamptz
    ),
    -- 9
    (
      'Is Gratitude Part of Your Daily Lifestyle?',
      'As Christians, gratitude should be a part of our daily lifestyles. The Bible reveals godly habits you and I need to develop to truly be thankful people: joyfulness, prayerfulness, and hopefulness.',
      '> "Make a joyful noise to the LORD, all the earth! Serve the LORD with gladness! Come into his presence with singing! Know that the LORD, he is God! It is he who made us, and we are his; we are his people, and the sheep of his pasture. Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name! For the LORD is good; his steadfast love endures forever, and his faithfulness to all generations."
>
> **Psalm 100**

The first habit is joyfulness. First Thessalonians 5:16 says, “Rejoice always.” This kind of joy is found by focusing on Jesus in the midst of your circumstances. 

The second habit is prayerfulness. First Thessalonians 5:17 tells us to “pray without ceasing.” We do this by acknowledging Him throughout the day and developing a habit of talking to Him about every experience we have in life.

The third habit is being intentional about being thankful! First Thessalonians 5:18 says, “Give thanks in all circumstances…” This means that in the midst of everything, God is good.

Finally, being thankful requires the habit of hopefulness. Believing what God says… that as a believer, you can become more and more like Jesus and that you will be with Him one day in heaven.',
      'is-gratitude-your-daily-lifestyle', 'draft'::text,
      'https://images.unsplash.com/photo-1628191140046-77c413645952?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1628191140046-77c413645952?w=400&h=300&fit=crop',
      'Jack Graham', 3,
      'Four Godly Habits of a Thankful Person', 'Explore four key habits from Scripture—joyfulness, prayerfulness, thankfulness, and hopefulness.',
      '2026-03-10 20:37:00'::timestamptz
    ),
    -- 10
    (
      'The Purpose of Pain and Hurt',
      'Someone once told me that pain is a good thing because it makes us aware. It can be like a stoplight, raising our awareness so that we don’t continue in the same path.',
      '> "But the Comforter, which is the Holy Ghost, whom the Father will send in my name, he shall teach you all things, and bring all things to your remembrance, whatsoever I have said unto you."
>
> **John 14:26**

Someone once told me that pain is a good thing because it makes us aware. I didn’t really like that observation because I think pain is bad, almost always. However, they explained that pain could kind of be like a stoplight, raising our awareness so that we don’t continue in the same path, helping us to avoid collisions and bad stuff.
      
Pain can also tell us that something is hurtful, something we should consider avoiding, something that could be wrong in our bodies or a situation.
      
> "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."
>
> **Romans 8:28**',
      'the-purpose-of-pain-and-hurt', 'draft'::text,
      'https://images.unsplash.com/photo-1519782414168-a400e00a311d?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1519782414168-a400e00a311d?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'How God Uses Pain for Our Good', 'Exploring the perspective that pain, while difficult, can serve as a divine warning and awareness tool.',
      '2026-03-14 20:37:00'::timestamptz
    ),
    -- 11
    (
      'Cry Me a River: The Freedom in Tears',
      'I believed the lie that tears are always a sign of weakness. I got to realize that in suppressing my tears, I was also holding back healing, surrender, and freedom!',
      '> "He will wipe every tear from their eyes."
>
> **Revelation 21:4**

Somewhere along the way, I believed the lie that tears are always a sign of weakness. I vividly remember several instances where I felt the pang of heartbreak and hurt combined. Tears quickly rushing and gushing to my eyes, my heart bleeding and thumping with unbearable aches. I consciously kept them from flowing.

Fast-forward years later when the dam finally broke. I got to realize that in the suppressing of my tears, I was also holding back healing, surrender, and freedom!

Do not ignore your tears, friends, and hold them not! The Psalmist encourages and confirms that God has kept count of our tossings, and put the tears in His bottle. Whether it be tears of sorrow and grief or tears of joy, let them flow freely.',
      'the-freedom-in-tears', 'draft'::text,
      'https://images.unsplash.com/photo-1549482156-a77b830a6e73?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1549482156-a77b830a6e73?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'God Bottles Our Tears: Finding Healing in Vulnerability', 'A testimony on embracing tears not as weakness, but as a path to healing, surrender, and freedom in Christ.',
      '2026-03-18 20:37:00'::timestamptz
    ),
    -- 12
    (
      'Building an Unshakeable Confidence',
      'Confidence is so hard to come by in our world today, yet so critical to our ability to withstand the storms of life. We must learn to build our confidence on the solid rock of Christ.',
      '> "Anyone who listens to my teaching and follows it is wise, like a person who builds a house on solid rock."
>
> **Matthew 7:24**

When the world seems to be falling apart it''s tempting to search for an escape route. But our Heavenly Father instructs us to engage in something more productive and powerful! We are to lean in and learn to build our confidence on this super solid rock rather than the shifting sand of this life. To develop a strong, bolder, immovable confidence in His will, plan and His ways.

We agree that confidence is so hard to come by in our world today yet, so critical to our ability to withstand the storms of life.',
      'building-unshakeable-confidence', 'draft'::text,
      'https://images.unsplash.com/photo-1552508744-166311634d3c?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1552508744-166311634d3c?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'Building Your Life on the Solid Rock of Christ', 'How to build an immovable confidence in God''s will and ways, rather than on the shifting sands of life.',
      '2026-03-22 20:37:00'::timestamptz
    ),
    -- 13
    (
      'The Importance of Healthy Boundaries',
      'As a child of God there is one wall in your defense system that has to be maintained and protected at all times - the wall of Self-Control.',
      '> "Whoever has no rule over his own spirit Is like a city broken down, without walls."
>
> **Proverbs 25:28**

J. Wilber Chapman, one of the greatest preachers, formulated what he called "My rule for Christian living". He said, "The rule that governs my life is this: Anything that DIMS my Vision of Christ or TAKES away my taste for Bible study, or CRAMPS my prayer life, or MAKES Christian work difficult is WRONG for me, and I must, as a Christian, TURN away from it."

As a child of God there is one wall in your defense system that has to be maintained and protected at all times - the wall of Self-Control. Biblical cultures used walls to protect themselves and to draw boundaries around themselves. The question for you and I is, have your boundary walls been breached or fallen into disrepair? If yes, do something about it today!',
      'the-importance-of-healthy-boundaries', 'draft'::text,
      'https://images.unsplash.com/photo-1524894951727-882224161b36?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1524894951727-882224161b36?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'Protecting Your Spirit with the Wall of Self-Control', 'Learn why self-control is a critical defense for a Christian and how to establish healthy spiritual boundaries.',
      '2026-03-26 20:37:00'::timestamptz
    ),
    -- 14
    (
      'The God of More Than Enough',
      'Are you facing a raging battle at the moment? I want to encourage you to trust in God''s Word. His promises are yea and amen. An Elim spring camp awaits!',
      '> "So the LORD saved Israel that day out of the hand of the Egyptians..."
>
> **Exodus 14:30**

Their journey however was not all smooth; they encountered numerous challenges. In the next chapter, in verse 27, God led His people to a place Known as Elim where there were 12 wells of water and 70 palm trees. Does this not beautifully point out to a God of "more than enough"? He led them to an oasis which was waiting around the corner just for them.

Palm trees are known to withstand severe tropical storms. When the gusts blow they do not break but instead bend with the wind and the heavy downpour simultaneously adapting to the hurricane. In the end of it all they stand more stronger than they were before.

Are you facing a raging battle at the moment? I want to encourage you to trust in God''s Word. His promises are yea and amen. An Elim spring camp awaits! He will be with us always; He is our rock and our oasis even in the midst of the fiercest of trials. Whatever the situation we can be sure that He is Jehovah El-Shaddai, the one who supplies, our God is always ENOUGH!',
      'the-god-of-more-than-enough', 'draft'::text,
      'https://images.unsplash.com/photo-1521405924724-5b32e1a3b341?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1521405924724-5b32e1a3b341?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'Finding Your Oasis in the Midst of Trials', 'An encouragement to trust in Jehovah El-Shaddai, the God who provides more than enough, even in the fiercest battles.',
      '2026-03-30 20:37:00'::timestamptz
    ),
    -- 15
    (
      'Wearing Many Hats, Following One King',
      'Attempting to wear every hat at once leads to chaos, but wearing my "follower of Jesus" hat first and always leads me to make decisions based off of His Word, Will and kingdom.',
      'At any given time, I am wearing my mama hat, my writer hat, my vocational hat, my homemaker hat, my daughter hat, friend hat, and business-owner hat. And on top of all these “hats,” I’m an avid follower of Jesus and have found it hard to spend time in the Word… which has led me to feel like I am falling short.

Yaas, truth be told that I cannot keep up with everything at once. But this doesn’t mean I am defeated; it means God is shifting my focus in this season. While I have had to set aside my vocational hat much more than I used to, I have gotten to wear my mama and homemaker hats even more. Attempting to wear every hat at once leads to chaos and confusion, but wearing my "follower of Jesus" first and always leads me to make decisions based off of His Word, Will and kingdom.

In the kingdom of God, success is obedience, worship, and surrender—and that’s the kind of success I desire in life. May we lay every hat at Jesus’ feet, and seek to follow Him first and foremost each and every day.',
      'wearing-many-hats', 'draft'::text,
      'https://images.unsplash.com/photo-1563253389-021c353982f2?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1563253389-021c353982f2?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'How to Prioritize Christ While Juggling Life''s Roles', 'A testimony on laying every "hat" at Jesus feet and finding success in obedience, worship, and surrender.',
      '2026-04-03 20:37:00'::timestamptz
    ),
    -- 16
    (
      'Fret Not, Fear Not: Faith Over Fear',
      'Fear can be a devastating and destructive force, breeding more fear and exaggerating the wolf. The answer? Faith in God and His many reassurances in scripture.',
      '> "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind."
>
> **1 Timothy 1:7**

Fear by description in one of the old English words means "sudden attack," "an ambush," or "a snare." One person said that fear is the darkroom where all our negatives are developed. It''s interest paid in advance on a debt you may never owe.

Fear can be a devastating and also a destructive force in one''s life! Why? Because it breeds more fear! It has the most insidious ability to exaggerate, making the wolf bigger than he really is. 

Let''s trace back our steps to the garden of Eden. Adam, God''s first creation, spoke these first recorded words: "I heard your voice in the garden, and I was afraid because I was naked; and I hid myself" (Genesis 3:10). Fear is genetic; it''s part of human nature.  

- Fear sickens, Faith HEALS. 
- Fear imprisons, Faith LIBERATES.
- Fear disheartens, Faith ENCOURAGES. 
- Fear weakens, Faith STRENGTHENS.
- Fear paralyzes, Faith EMPOWERS.

So, what shall we do? Have Faith in God! When you total up all the reassurances in scripture and continually practice their truths, Isaiah 26:3 tells us, "You will keep him in perfect peace Whose mind is stayed on You, Because he trusts in You." Do not let fear rob you of your potential!',
      'fret-not-fear-not', 'draft'::text,
      'https://images.unsplash.com/photo-1605106702734-205f2d4ec374?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1605106702734-205f2d4ec374?w=400&h=300&fit=crop',
      'Jambo Apparels', 3,
      'Choosing Faith Over the Spirit of Fear', 'An exploration of how to combat the destructive force of fear by standing firmly on God''s promises of power, love, and a sound mind.',
      '2026-04-07 20:37:00'::timestamptz
    ),
    -- 17
    (
      'A Call to Walk Circumspectly',
      'To walk circumspectly, we must understand the will of God in every circumstance and be careful to follow it. Spiritual alertness and sensitivity is paramount for every child of the Father.',
      '> "Be sober, be vigilant; because your adversary the devil walks about like a roaring lion, seeking whom he may devour."
>
> **1 Peter 5:8**

To walk circumspectly we must understand what the will of God is for us in every circumstance and be careful to follow it at all times. To do this, it is necessary to study His word and allow it to be that lamp unto our feet and a light that directs our paths.

As saints we are called to a crucified life—dead to the world and its enticements. We cannot afford to pattern our lives after the manner of this fading world and still please God. Remember, "If any man love the world, the love of the Father is not in him" (1 John 2:15).

Consequently, wisdom demands that we do away with anything that conforms us to the world in any way by renewing our minds. We are pilgrims, and as the scripture tells us in Hebrews, there is no permanent city for us here on earth. Rather, we should look forward to the city to come, a better country, that is a heavenly one, whose builder and maker is God.

Let''s live a life that glorifies God, spending it on things of eternal value and allowing His light to reflect through us, being careful not to be blinded by the cares and concerns of this world.',
      'walk-circumspectly', 'draft'::text,
      'https://images.unsplash.com/photo-1507034589659-3338ec6a9381?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1507034589659-3338ec6a9381?w=400&h=300&fit=crop',
      'Jambo Apparels', 3,
      'How to Live a Life That Glorifies God', 'Exploring the call to walk circumspectly, living with spiritual alertness and focusing on things of eternal value.',
      '2026-04-11 20:37:00'::timestamptz
    ),
    -- 18
    (
      'Finding Deeper Inner Strength in Christ',
      'Apostle Paul knew what it was like to go through extremely challenging times. He discovered a deep inner strength, the ability to keep going, adapt, and eventually emerge even stronger.',
      '> "I have learned the secret of living in every situation... For I can do everything through Christ, who gives me strength."
>
> **Philippians 4:12-13**

Apostle Paul knew what it was like to go through extremely challenging times. He was unfairly shoved into prison, shipwrecked, snake-bitten, and stoned.

As we navigate the various seasons of our lives, we may feel lonely and isolated, infuriated and incensed, rejected and dejected. Let''s quickly remember, dearly beloved, that with God we can get through it! Paul discovered a deep inner strength—the ability to keep going, to adapt, and eventually to emerge even stronger and victorious!

> "I have fought the good fight, I have finished the race, I have kept the faith."
>
> **2 Timothy 4:7**

May you be encouraged to turn to God in all your circumstances and find your own inner strength through Jesus!',
      'finding-deeper-inner-strength', 'draft'::text,
      'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=400&h=300&fit=crop',
      'Jambo Apparels', 2,
      'The Secret to Living in Every Situation', 'Learn from the Apostle Paul how to find a deep inner strength through Christ to endure any circumstance.',
      '2026-04-15 20:37:00'::timestamptz
    ),
    -- 19
    (
      'How to Engage with The Word',
      'God''s Word reveals to us His insights into the world. We must faithfully and consistently continue in His Word if we are to see our circumstances clearly. How? Read it, Hide It, Pray It, and Live It.',
      '> "In the beginning was the Word, and the Word was with God, and the Word was God."
>
> **John 1:1**

God''s Word reveals to us His insights into the world. We must faithfully and consistently continue in His Word if we are to see our circumstances clearly. How then do we do this?

### Read the Word - Study It
> "All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness."
> **2 Timothy 3:16**
Develop the rich habit of reading the Bible daily, ideally setting aside twenty or thirty minutes.

### Hide His Word - Memorize It
> "This Book of the Law shall not depart from your mouth, but you shall meditate in it day and night..."
> **Joshua 1:8**
As you invest time in His Word you will want to memorize it and hide it in your heart.

### Guide the Word - Pray It
> "Then King David went in and sat before the LORD; and he said: “Who am I, O LORD God?""
> **1 Chronicles 17:16**
If we pray the Word as we read through, it helps us to focus on a rich variety of scriptural proportions.

### Live the Word - Display It
> "Let your light so shine before men, that they may see your good works and glorify your Father in heaven."
> **Matthew 5:15**
Paul told young Timothy, "Preach the word! Be ready in season and out of season."

My prayer is that, as we Study, Memorize, Pray and Display His Word, we begin viewing life through the eyes of our Heavenly Father.',
      'how-to-engage-with-the-word', 'draft'::text,
      'https://images.unsplash.com/photo-1471970471555-19d4b113e3ed?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1471970471555-19d4b113e3ed?w=400&h=300&fit=crop',
      'Jambo Apparels', 3,
      'Four Ways to Deepen Your Relationship with Scripture', 'A practical guide on how to study, memorize, pray, and live out God''s Word to see life through His eyes.',
      '2026-04-19 20:37:00'::timestamptz
    )
) AS v(title, summary, content, slug, status, featured_image, thumbnail, author, reading_time, seo_title, seo_description, scheduled_for)
ON CONFLICT (slug) DO NOTHING;
