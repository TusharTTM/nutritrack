#!/usr/bin/env python3
# Generates SVG mockups of the NutriTrack app UI (Ink & Lime, dark theme).
import math, os

OUT = os.path.join(os.path.dirname(__file__))
W, H = 390, 844            # screen size
PAD = 20
CW = W - 2 * PAD           # 350 content width

# ── Ink & Lime palette (dark theme, matches src/utils/theme.js) ────────────
BG      = '#0E100B'
BG2     = '#13160E'
INK     = '#0E100B'
INK2    = '#161A10'
LIME    = '#C6F24E'
LIME_D  = '#A3E635'
PAPER   = '#F2F4EC'
SUB     = '#C3C8B6'
MUTED   = '#8A9078'
HERO_SUB= '#B9C0AC'
CARD    = '#15180F'
CARD_BR = 'rgba(200,225,140,0.16)'
PROTEIN = '#9A9AF5'
CARBS   = '#F2C14E'
FAT     = '#F58BBE'
FIBER   = '#4FD6C6'
WATER   = '#5AB4F0'
WARN    = '#F0B44E'
TEAL    = '#4FD6C6'
FONT    = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def T(x,y,s,size=14,weight=400,fill=PAPER,anchor='start',ls=0,op=1):
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}" opacity="{op}">{esc(s)}</text>')

def R(x,y,w,h,fill='none',rx=0,stroke=None,sw=0,op=1):
    s=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" opacity="{op}"'
    if stroke: s+=f' stroke="{stroke}" stroke-width="{sw}"'
    return s+'/>'

def C(cx,cy,r,fill='none',stroke=None,sw=0,op=1):
    s=f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" opacity="{op}"'
    if stroke: s+=f' stroke="{stroke}" stroke-width="{sw}"'
    return s+'/>'

def L(x1,y1,x2,y2,stroke,sw=2,cap='round',op=1,dash=None):
    d=f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}" opacity="{op}"{d}/>'

def P(d,fill='none',stroke=None,sw=0,op=1,cap='round',join='round'):
    s=f'<path d="{d}" fill="{fill}" opacity="{op}" stroke-linecap="{cap}" stroke-linejoin="{join}"'
    if stroke: s+=f' stroke="{stroke}" stroke-width="{sw}"'
    return s+'/>'

def bar(x,y,w,h,pct,color,track='rgba(200,225,140,0.16)'):
    rx=h/2
    return R(x,y,w,h,track,rx=rx)+R(x,y,max(h,w*pct),h,color,rx=rx)

def ring(cx,cy,r,pct,color,track='rgba(200,225,140,0.16)',sw=13):
    pct=max(0.0,min(1.0,pct))
    ang=-math.pi/2+2*math.pi*pct
    x=cx+r*math.cos(ang); y=cy+r*math.sin(ang)
    large=1 if pct>0.5 else 0
    trackp=f'M {cx-r} {cy} A {r} {r} 0 1 1 {cx+r} {cy} A {r} {r} 0 1 1 {cx-r} {cy}'
    prog=f'M {cx} {cy-r:.1f} A {r} {r} 0 {large} 1 {x:.2f} {y:.2f}'
    return (f'<path d="{trackp}" fill="none" stroke="{track}" stroke-width="{sw}"/>'
            f'<path d="{prog}" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>')

# ── Icons (24-grid) ─────────────────────────────────────────────────────────
ICONS = {
 'flame':   ('M12 2C9.5 6 6 8.2 6 12.7A6 6 0 0 0 18 12.7C18 9.8 16 7.9 14.2 6.1 13.7 7.7 12.6 8.6 11.4 8.9 11.9 6.7 11.7 4.3 12 2Z','fill'),
 'water':   ('M12 2.5c3.8 4.7 6.5 8 6.5 11.3A6.5 6.5 0 0 1 5.5 13.8C5.5 10.5 8.2 7.2 12 2.5Z','fill'),
 'home':    ('M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z','stroke'),
 'leaf':    ('M5 19C5 9 11 5 20 5c0 9-5 14-14 14M5 19c2-4 5-6.5 9-8','stroke'),
 'chart':   ('M5 20V11M12 20V4M19 20v-6','stroke'),
 'pulse':   ('M4 12h3.5l2-6 4 12 2.5-6H20','stroke'),
 'person':  ('<circle cx="12" cy="8" r="3.3"/><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6"/>','stroke'),
 'plus':    ('M12 6v12M6 12h12','stroke'),
 'heart':   ('M12 20s-7-4.3-7-9.3A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.7C19 15.7 12 20 12 20z','stroke'),
 'arrow':   ('M5 12h13M13 7l5 5-5 5','stroke'),
 'back':    ('M15 5l-7 7 7 7','stroke'),
 'flag':    ('M6 21V4M6 4h11l-2 3.5L17 11H6','stroke'),
 'target':  ('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/>','stroke'),
 'addc':    ('<circle cx="12" cy="12" r="8.5"/><path d="M12 8.5v7M8.5 12h7"/>','stroke'),
 'search':  ('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>','stroke'),
 'bell':    ('M18 15v-4a6 6 0 1 0-12 0v4l-1.5 3h15zM10 21h4','stroke'),
 'check':   ('M5 13l4 4L19 7','stroke'),
 'chev':    ('M9 6l6 6-6 6','stroke'),
 'signout': ('M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h9','stroke'),
 'glass':   ('M7 4h10l-1.2 16H8.2zM7.3 10h9.4','stroke'),
 'wifi':    ('M4 9.2a13 13 0 0 1 16 0M7 12.6a8.5 8.5 0 0 1 10 0M10 16a4 4 0 0 1 4 0','stroke'),
 'signal':  ('M4 20v-3M9.3 20v-6M14.6 20V9M19.9 20V5','stroke'),
 'run':     ('<circle cx="14" cy="5" r="2"/><path d="M13 8l-3 4 3 2 1 6M10 12l-3 2M16 10l3 1 1 4"/>','stroke'),
 'gear':    ('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18"/>','stroke'),
 'drop':    ('M12 3c3.5 4.4 5.5 7.3 5.5 10A5.5 5.5 0 0 1 6.5 13c0-2.7 2-5.6 5.5-10z','stroke'),
 'book':    ('M5 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5zM19 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z','stroke'),
 'group':   ('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3 3 0 0 1 0 5.6M17.5 14.8c2 .8 3.5 2.6 3.5 5.2"/>','stroke'),
}
def ico(name,x,y,s,color,sw=1.8):
    m,mode=ICONS[name]
    if mode=='fill':
        return f'<g transform="translate({x},{y}) scale({s/24})" fill="{color}" stroke="none">{m}</g>'
    return (f'<g transform="translate({x},{y}) scale({s/24})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{m}</g>')

# ── Shared chrome ───────────────────────────────────────────────────────────
def defs():
    return ('<defs>'
      '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
      f'<stop offset="0" stop-color="{BG}"/><stop offset="1" stop-color="{BG2}"/></linearGradient>'
      '<linearGradient id="hero" x1="0.2" y1="0" x2="0.8" y2="1">'
      f'<stop offset="0" stop-color="{INK}"/><stop offset="1" stop-color="{INK2}"/></linearGradient>'
      '<linearGradient id="cta" x1="0" y1="0" x2="1" y2="1">'
      '<stop offset="0" stop-color="#D4F75E"/><stop offset="1" stop-color="#A8D62E"/></linearGradient>'
      '<radialGradient id="aur1"><stop offset="0" stop-color="#C6F24E" stop-opacity="0.20"/><stop offset="1" stop-color="#C6F24E" stop-opacity="0"/></radialGradient>'
      '<radialGradient id="aur2"><stop offset="0" stop-color="#4FD6C6" stop-opacity="0.16"/><stop offset="1" stop-color="#4FD6C6" stop-opacity="0"/></radialGradient>'
      '<linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0.07"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>'
      '</defs>')

def aurora():
    return (f'<circle cx="60" cy="120" r="240" fill="url(#aur1)"/>'
            f'<circle cx="350" cy="760" r="260" fill="url(#aur2)"/>')

def status_bar():
    return (T(34,42,'9:41',15,600,PAPER)
            +ico('signal',300,28,15,PAPER,1.9)
            +ico('wifi',322,28,15,PAPER,1.9)
            +R(346,30,22,12,'none',rx=3.5,stroke=PAPER,sw=1.4)
            +R(348,32,13,8,PAPER,rx=1.6)
            +R(370,33,2,6,PAPER,rx=1))

def tab_bar(active):
    tabs=[('home','Home'),('leaf','Nutrition'),('chart','Progress'),('pulse','Activity'),('person','Profile')]
    y=760; h=84
    s=R(0,y,W,h,'rgba(14,16,11,0.92)')+L(0,y,W,y,'rgba(200,225,140,0.12)',1)
    seg=W/len(tabs)
    for i,(ic,lab) in enumerate(tabs):
        cx=seg*i+seg/2
        on=(i==active)
        col=LIME if on else MUTED
        if on:
            s+=R(cx-26,y+8,52,32,'rgba(198,242,78,0.14)',rx=16)
        s+=ico(ic,cx-9,y+14,18,col,2)
        s+=T(cx,y+58,lab,10,600 if on else 500,col,anchor='middle')
    s+=R(W/2-60,830,120,5,'rgba(242,244,236,0.35)',rx=2.5)
    return s

def header(title, sub=None, right=None, back=False):
    y=88
    s=T(PAD+ (28 if back else 0), y, title, 26, 800, PAPER)
    if sub: s+=T(PAD+(28 if back else 0), y+22, sub, 13, 400, MUTED)
    if back: s+=ico('back',PAD,y-22,24,PAPER,2)
    if right: s+=right(PAD+CW)
    return s

def card(x,y,w,h,rx=20,fill=CARD):
    return (R(x,y,w,h,fill,rx=rx,stroke=CARD_BR,sw=1)
            +R(x,y,w,h*0.5,'url(#sheen)',rx=rx))

def home_indicator():
    return R(W/2-60,830,120,5,'rgba(242,244,236,0.30)',rx=2.5)

# ── Screens ──────────────────────────────────────────────────────────────────
def scr_login():
    s=header_skip=T(0,0,'',1)  # noop
    s=R(0,0,W,H,'url(#bg)')+aurora()
    # brand mark
    s+=R(W/2-38,150,76,76,'rgba(198,242,78,0.12)',rx=24,stroke='rgba(198,242,78,0.3)',sw=1)
    s+=ico('leaf',W/2-18,168,36,LIME,2)
    s+=T(W/2,262,'NutriTrack',30,800,PAPER,anchor='middle',ls=-0.5)
    s+=T(W/2,292,'Eat Better. Live Healthier.',15,500,SUB,anchor='middle')
    # fields
    fy=380
    for ph in ['Email','Password']:
        s+=R(PAD,fy,CW,54,'rgba(220,235,180,0.05)',rx=16,stroke=CARD_BR,sw=1)
        s+=T(PAD+18,fy+22,ph,11,600,MUTED)
        s+=T(PAD+18,fy+42,'••••••••' if ph=='Password' else 'aarav@example.com',14,500,PAPER if ph!='Password' else MUTED)
        fy+=70
    # primary CTA
    s+=R(PAD,556,CW,56,'url(#cta)',rx=28)
    s+=T(W/2,556+35,'Log in',16,700,INK,anchor='middle')
    s+=T(W/2,640,'Forgot password?',13,600,SUB,anchor='middle')
    # divider + social
    s+=L(PAD+40,690,W-PAD-40,690,'rgba(200,225,140,0.16)',1)
    s+=T(W/2,684,'or continue with',11,500,MUTED,anchor='middle')
    for i,ic in enumerate(['group','heart','bell']):
        cx=W/2-52+i*52
        s+=R(cx-22,706,44,44,'rgba(220,235,180,0.05)',rx=14,stroke=CARD_BR,sw=1)
        s+=ico(ic,cx-9,719,18,SUB,1.9)
    s+=T(W/2,800,"Don't have an account? Sign up",13,600,SUB,anchor='middle')
    s+=home_indicator()
    return s

def scr_onboarding():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=ico('back',PAD,86,24,PAPER,2)
    # progress dots
    for i in range(4):
        cx=W/2-33+i*22
        col=LIME if i==2 else 'rgba(200,225,140,0.22)'
        s+=C(cx,92,4,col if i==2 else None, col if i!=2 else None,2)
    s+=T(PAD,190,'Your body stats',30,800,PAPER,ls=-0.6)
    s+=T(PAD,222,'We use this to calculate your daily targets.',14,400,SUB)
    # segmented (gender)
    s+=T(PAD,280,'GENDER',11,700,MUTED,ls=1)
    for i,g in enumerate(['Male','Female','Other']):
        x=PAD+i*(CW/3)
        w=CW/3-8
        on=(i==0)
        s+=R(x,294,w,46,'rgba(198,242,78,0.14)' if on else 'rgba(220,235,180,0.05)',rx=14,
              stroke=LIME if on else CARD_BR,sw=1)
        s+=T(x+w/2,322,g,13,600,LIME if on else SUB,anchor='middle')
    # stat fields grid
    fields=[('AGE','28'),('HEIGHT','178 cm'),('WEIGHT','79 kg')]
    for i,(lab,val) in enumerate(fields):
        x=PAD+(i%2)*(CW/2); y=372+(i//2)*96; w=CW/2-8
        s+=R(x,y,w,80,'rgba(220,235,180,0.05)',rx=16,stroke=CARD_BR,sw=1)
        s+=T(x+16,y+26,lab,10,700,MUTED,ls=1)
        s+=T(x+16,y+58,val,22,800,PAPER)
    s+=R(PAD,600,CW,56,'url(#cta)',rx=28)
    s+=T(W/2,635,'Continue',16,700,INK,anchor='middle')
    s+=T(W/2,636,'',1)
    s+=T(W/2,690,'Step 3 of 4',12,500,MUTED,anchor='middle')
    s+=home_indicator()
    return s

def scr_home():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    # top header
    s+=C(PAD+22,92,22,'rgba(198,242,78,0.14)',stroke='rgba(198,242,78,0.3)',sw=1)+ico('person',PAD+13,83,18,LIME,2)
    s+=T(PAD+56,86,'GOOD MORNING',11,700,LIME,ls=1)
    s+=T(PAD+56,106,'Aarav',18,700,PAPER)
    s+=ico('flame',W-PAD-64,74,20,WARN,2)+T(W-PAD-38,92,'12',16,800,PAPER)
    # hero banner
    hy=132; hh=300
    s+=R(PAD,hy,CW,hh,'url(#hero)',rx=26)
    s+=C(PAD+CW-40,hy+30,90,'url(#aur1)')  # glow
    s+=C(PAD+40,hy+hh-40,80,'rgba(79,214,198,0.10)')
    s+=R(PAD+30,hy+40,120,120,'none',rx=60,stroke='rgba(198,242,78,0.16)',sw=1)
    s+=R(PAD+18,hy+58,96,96,'none',rx=48,stroke='rgba(79,214,198,0.14)',sw=1)
    s+=ico('flame',PAD+30,hy+28,13,LIME,2)+T(PAD+50,hy+39,'GOOD MORNING',10,700,LIME,ls=1.4)
    s+=T(PAD+30,hy+92,'Eat Better.',40,800,PAPER,ls=-1)
    s+=T(PAD+30,hy+134,'Live Healthier.',40,800,LIME,ls=-1)
    s+=T(PAD+30,hy+172,'Track meals, macros, water and habits —',13,400,HERO_SUB)
    s+=T(PAD+30,hy+190,'all in one calm, beautiful place.',13,400,HERO_SUB)
    # hero CTAs
    s+=R(PAD+30,hy+214,176,48,'url(#cta)',rx=24)
    s+=ico('addc',PAD+46,hy+229,20,INK,2)+T(PAD+72,hy+243,'Log a meal',14,700,INK)
    s+=R(PAD+216,hy+214,120,48,'rgba(198,242,78,0.14)',rx=24,stroke='rgba(198,242,78,0.4)',sw=1)
    s+=T(PAD+234,hy+243,'View progress',13,600,LIME)+ico('arrow',PAD+234,hy+229,16,LIME,2)
    # Daily calories card
    cy=hy+hh+16
    s+=card(PAD,cy,CW,168)
    s+=T(PAD+20,cy+30,'Daily calories',17,600,PAPER)
    s+=R(PAD+CW-118,cy+16,98,26,'rgba(198,242,78,0.12)',rx=13,stroke=CARD_BR,sw=1)
    s+=ico('flag',PAD+CW-108,cy+22,14,LIME,2)+T(PAD+CW-88,cy+34,'Goal 2200',10,600,LIME)
    # ring + side
    s+=ring(88,cy+108,44,1486/2200,LIME)
    s+=T(88,cy+104,'714',24,800,PAPER,anchor='middle')
    s+=T(88,cy+120,'left',11,500,MUTED,anchor='middle')
    s+=T(PAD+160,cy+72,'From food',11,500,MUTED)
    s+=T(PAD+160,cy+104,'1,486',30,800,PAPER)
    s+=T(PAD+160,cy+124,'kcal eaten',12,400,MUTED)
    s+=ico('flame',PAD+160,cy+134,13,WARN,2)+T(PAD+178,cy+145,'412 burned',11,500,SUB)
    # Nutrition macros
    my=cy+168+22
    s+=T(PAD,my,'Nutrition',19,700,PAPER)
    s+=T(PAD,my+20,'Daily macro progress',13,400,MUTED)
    s+=ico('leaf',W-PAD-20,my,20,LIME,2)
    macros=[('Protein',96,150,PROTEIN),('Carbs',180,250,CARBS),('Fat',52,70,FAT),('Fiber',24,30,FIBER)]
    for i,(lab,v,g,col) in enumerate(macros):
        x=PAD+(i%2)*(CW/2); y=my+38+(i//2)*76; w=CW/2-8
        s+=R(x,y,w,66,'rgba(220,235,180,0.04)',rx=16,stroke=CARD_BR,sw=1)
        s+=T(x+14,y+24,lab,13,600,PAPER)
        s+=T(x+14,y+44,f'{v}/{g}g',11,500,MUTED)
        s+=bar(x+14,y+52,w-28,6,v/g,col)
    # Water + Activity
    wy=my+38+152+8
    s+=card(PAD,wy,CW/2-8,168)
    s+=ico('water',PAD+16,wy+18,20,WATER,2)+T(PAD+42,wy+33,'Water',15,600,PAPER)
    s+=T(PAD+16,wy+72,'1.5',30,800,WATER)+T(PAD+58,wy+72,'L',14,600,WATER)
    s+=T(PAD+16,wy+92,'/ 2.5 L goal',11,500,MUTED)
    s+=bar(PAD+16,wy+104,CW/2-40,6,0.6,WATER)
    for i,ml in enumerate([250,500,1000]):
        x=PAD+16+i*((CW/2-32)/3)
        s+=R(x,wy+124,(CW/2-40)/3-6,30,'rgba(90,180,240,0.12)',rx=10,stroke=CARD_BR,sw=1)
        s+=T(x+((CW/2-40)/3-6)/2,wy+144,f'+{ml}',10,700,WATER,anchor='middle')
    s+=card(PAD+CW/2+8,wy,CW/2-8,168)
    ax=PAD+CW/2+8
    s+=ico('flame',ax+16,wy+18,20,WARN,2)+T(ax+42,wy+33,'Activity',15,600,PAPER)
    s+=T(ax+16,wy+72,'412',30,800,WARN)
    s+=T(ax+16,wy+92,'kcal burned',11,500,MUTED)
    s+=T(ax+16,wy+124,'3 workouts',12,500,SUB)
    s+=T(ax+16,wy+144,'today',12,500,SUB)
    # Today's meals
    ly=wy+168+20
    s+=T(PAD,ly,"Today's Meals",17,600,PAPER)
    s+=T(PAD+CW-90,ly,'Tap + to add',11,500,MUTED)
    meals=[('Breakfast','Oatmeal & berries',420),('Lunch','Grilled chicken bowl',680),('Snack','Greek yogurt',180)]
    for i,(m,item,kcal) in enumerate(meals):
        y=ly+16+i*58
        s+=R(PAD,y,CW,50,'rgba(220,235,180,0.04)',rx=14,stroke=CARD_BR,sw=1)
        s+=C(PAD+26,y+25,14,'rgba(198,242,78,0.12)')+ico('leaf',PAD+19,y+18,14,LIME,1.9)
        s+=T(PAD+50,y+22,m,13,600,PAPER)
        s+=T(PAD+50,y+38,item,11,400,MUTED)
        s+=T(PAD+CW-16,y+30,f'{kcal}',13,700,SUB,anchor='end')+T(PAD+CW-16,y+30,'',1)
        s+=T(PAD+CW-58,y+30,'kcal',10,500,MUTED,anchor='end')
    s+=tab_bar(0)
    return s

def scr_diary():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Diary','Your food journal')
    s+=R(PAD+CW-40,74,40,40,'rgba(198,242,78,0.12)',rx=14,stroke=CARD_BR,sw=1)+ico('plus',PAD+CW-28,82,24,LIME,2)
    # date strip
    days=['M','T','W','T','F','S','S']; sel=3
    for i,d in enumerate(days):
        x=PAD+8+i*(CW-16)/7; w=(CW-16)/7-6
        on=(i==sel)
        s+=R(x,130,w,58,'rgba(198,242,78,0.16)' if on else 'rgba(220,235,180,0.04)',rx=14,
              stroke=LIME if on else CARD_BR,sw=1)
        s+=T(x+w/2,152,d,11,600,LIME if on else MUTED,anchor='middle')
        s+=T(x+w/2,172,str(3+i*1) if i<7 else '',13,700 if on else 500,PAPER if on else SUB,anchor='middle')
    # summary
    s+=card(PAD,204,CW,66)
    s+=T(PAD+20,232,'Total',12,500,MUTED)
    s+=T(PAD+20,258,'1,486',22,800,PAPER)+T(PAD+96,258,'/ 2200 kcal',12,500,MUTED)
    s+=bar(PAD+180,244,CW-200,8,1486/2200,LIME)
    # meal groups
    groups=[('Breakfast',420,[('Oatmeal & berries','240g',280),('Orange juice','200ml',90)]),
            ('Lunch',680,[('Grilled chicken bowl','350g',520),('Side salad','150g',160)]),
            ('Dinner',386,[('Salmon & veggies','300g',386)])]
    gy=290
    for name,kcal,items in groups:
        s+=T(PAD,gy,name,15,700,PAPER)
        s+=T(PAD+CW-16,gy,f'{kcal}',13,700,SUB,anchor='end')
        for it,wt,k in items:
            y=gy+12
            s+=R(PAD,y,CW,44,'rgba(220,235,180,0.04)',rx=12,stroke=CARD_BR,sw=1)
            s+=T(PAD+16,y+19,it,12,500,PAPER)
            s+=T(PAD+16,y+34,wt,10,400,MUTED)
            s+=T(PAD+CW-16,y+27,f'{k} kcal',11,600,SUB,anchor='end')
            gy+=50
        gy+=28
    s+=home_indicator()
    return s

def scr_nutrition():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Nutrition','Macros & food log')
    s+=R(PAD+CW-40,74,40,40,'rgba(198,242,78,0.12)',rx=14,stroke=CARD_BR,sw=1)+ico('addc',PAD+CW-28,82,24,LIME,2)
    # segmented Today/Week
    for i,lab in enumerate(['Today','This Week']):
        x=PAD+i*(CW/2); w=CW/2-4
        on=(i==0)
        s+=R(x,124,w,40,'rgba(198,242,78,0.14)' if on else 'rgba(220,235,180,0.04)',rx=12,
              stroke=LIME if on else CARD_BR,sw=1)
        s+=T(x+w/2,149,lab,13,600,LIME if on else SUB,anchor='middle')
    # big macro ring row
    s+=card(PAD,180,CW,150)
    cx=W/2
    s+=ring(cx,272,52,1486/2200,LIME)
    s+=T(cx,266,'1,486',24,800,PAPER,anchor='middle')
    s+=T(cx,284,'of 2200 kcal',11,500,MUTED,anchor='middle')
    macros=[('Protein',96,150,PROTEIN),('Carbs',180,250,CARBS),('Fat',52,70,FAT)]
    for i,(lab,v,g,col) in enumerate(macros):
        x=PAD+24+i*((CW-48)/3)
        s+=T(x,338,lab,11,500,MUTED,anchor='middle')
        s+=bar(x-28,346,56,6,v/g,col)
        s+=T(x,368,f'{v}g',12,700,PAPER,anchor='middle')
    # Recent foods
    s+=T(PAD,402,'Recent Foods',17,600,PAPER)
    foods=[('Chicken breast','165 kcal / 100g'),('Brown rice','112 kcal / 100g'),
           ('Avocado','160 kcal / 100g'),('Greek yogurt','59 kcal / 100g'),
           ('Almonds','579 kcal / 100g')]
    for i,(f,k) in enumerate(foods):
        y=422+i*54
        s+=R(PAD,y,CW,48,'rgba(220,235,180,0.04)',rx=14,stroke=CARD_BR,sw=1)
        s+=C(PAD+26,y+24,15,'rgba(198,242,78,0.10)')+ico('leaf',PAD+19,y+17,14,LIME,1.9)
        s+=T(PAD+50,y+22,f,13,600,PAPER)
        s+=T(PAD+50,y+38,k,10,400,MUTED)
        s+=ico('addc',PAD+CW-38,y+14,22,LIME,2)
    s+=tab_bar(1)
    return s

def scr_progress():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Progress','Your trends')
    # stats row
    stats=[('-4.2','kg lost',LIME),('12','day streak',WARN),('79','kg now',SUB)]
    for i,(v,lab,col) in enumerate(stats):
        x=PAD+i*(CW/3)
        s+=R(x+4,124,CW/3-8,84,'rgba(220,235,180,0.04)',rx=16,stroke=CARD_BR,sw=1)
        s+=T(x+(CW/3)/2,160,v,24,800,col,anchor='middle')
        s+=T(x+(CW/3)/2,182,lab,11,500,MUTED,anchor='middle')
    # weight chart
    s+=card(PAD,224,CW,236)
    s+=T(PAD+20,254,'Weight History',17,600,PAPER)
    s+=ico('flag',W-PAD-22,238,18,LIME,2)
    pts=[82.0,81.4,81.1,80.3,79.8,79.2,79.0]
    gx=PAD+20; gy=430; gw=CW-40; gh=140
    # gridlines
    for i in range(4):
        yy=gy-gh+ i*gh/3
        s+=L(gx,yy,gx+gw,yy,'rgba(200,225,140,0.08)',1)
    lo,hi=78.5,82.5
    path='M'
    for i,p in enumerate(pts):
        x=gx+i*gw/(len(pts)-1); y=gy-gh+(p-lo)/(hi-lo)*gh
        path+=f'{x:.1f} {y:.1f}'+(' L' if i<len(pts)-1 else '')
    s+=f'<path d="{path} L{gx+gw} {gy} L{gx} {gy} Z" fill="url(#aur1)"/>'
    s+=P(path,stroke=LIME,sw=3)
    for i,p in enumerate(pts):
        x=gx+i*gw/(len(pts)-1); y=gy-gh+(p-lo)/(hi-lo)*gh
        s+=C(x,y,3.5,LIME) if i==len(pts)-1 else C(x,y,2.6,'none',LIME,2)
    s+=T(gx,gy+16,'Mon',10,500,MUTED,anchor='middle')
    s+=T(gx+gw,gy+16,'Sun',10,500,MUTED,anchor='middle')
    # water goal
    s+=card(PAD,476,CW,110)
    s+=ico('water',PAD+20,494,22,WATER,2)+T(PAD+52,512,'Water',16,600,PAPER)
    s+=T(PAD+CW-20,512,'1.5 / 2.5 L',12,600,SUB,anchor='end')
    s+=bar(PAD+20,540,CW-40,10,0.6,WATER)
    s+=T(PAD+20,576,'Daily goal 2.5 L',11,500,MUTED)
    # log weight button
    s+=R(PAD,600,CW,54,'url(#cta)',rx=27)
    s+=T(W/2,633,'Log Weight',16,700,INK,anchor='middle')
    s+=tab_bar(2)
    return s

def scr_activity():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Activity','Workouts & burn')
    s+=R(PAD+CW-40,74,40,40,'rgba(198,242,78,0.12)',rx=14,stroke=CARD_BR,sw=1)+ico('plus',PAD+CW-28,82,24,LIME,2)
    # today summary
    s+=card(PAD,124,CW,120)
    s+=ico('flame',PAD+22,146,26,WARN,2)+T(PAD+60,168,'412',30,800,PAPER)
    s+=T(PAD+60,190,'kcal burned today',12,500,MUTED)
    s+=C(PAD+CW-56,176,30,'rgba(240,180,78,0.14)')+ico('run',PAD+CW-68,164,24,WARN,2)
    # today's activities
    s+=T(PAD,268,'Today',17,600,PAPER)
    acts=[('Morning run','30 min · 320 kcal'),('Evening walk','20 min · 92 kcal')]
    for i,(a,k) in enumerate(acts):
        y=282+i*58
        s+=R(PAD,y,CW,50,'rgba(220,235,180,0.04)',rx=14,stroke=CARD_BR,sw=1)
        s+=C(PAD+26,y+25,15,'rgba(240,180,78,0.14)')+ico('run',PAD+19,y+18,14,WARN,1.9)
        s+=T(PAD+50,y+22,a,13,600,PAPER)
        s+=T(PAD+50,y+38,k,11,400,MUTED)
        s+=ico('chev',PAD+CW-30,y+18,18,MUTED,2)
    # browse activities
    s+=T(PAD,412,'Browse Activities',17,600,PAPER)
    cats=[('Running','run',WARN),('Cycling','pulse',WATER),('Walking','run',LIME),
          ('Swimming','drop',WATER),('Strength','chart',PROTEIN),('Yoga','heart',FAT)]
    for i,(name,ic,col) in enumerate(cats):
        x=PAD+(i%3)*((CW-16)/3); y=440+(i//3)*96; w=(CW-16)/3-8
        s+=R(x,y,w,84,'rgba(220,235,180,0.04)',rx=18,stroke=CARD_BR,sw=1)
        s+=C(x+w/2,y+30,20,col+'22')+ico(ic,x+w/2-11,y+19,22,col,2)
        s+=T(x+w/2,y+66,name,11,600,SUB,anchor='middle')
    s+=R(PAD,646,CW,54,'url(#cta)',rx=27)
    s+=T(W/2,679,'Log Activity',16,700,INK,anchor='middle')
    s+=tab_bar(3)
    return s

def scr_profile():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Profile','Account & goals')
    s+=R(PAD+CW-40,74,40,40,'rgba(198,242,78,0.12)',rx=14,stroke=CARD_BR,sw=1)+ico('gear',PAD+CW-28,82,22,SUB,2)
    # profile header
    s+=C(W/2,180,44,'rgba(198,242,78,0.14)',stroke='rgba(198,242,78,0.3)',sw=1)+ico('person',W/2-15,165,30,LIME,2)
    s+=T(W/2,250,'Aarav Sharma',20,700,PAPER,anchor='middle')
    s+=T(W/2,272,'aarav@example.com',13,400,MUTED,anchor='middle')
    # personal info
    s+=T(PAD,314,'Personal Info',15,600,PAPER)
    info=[('Age','28'),('Gender','Male'),('Height','178 cm'),('Weight','79 kg')]
    for i,(lab,val) in enumerate(info):
        x=PAD+(i%2)*(CW/2); y=332+(i//2)*66; w=CW/2-8
        s+=R(x,y,w,58,'rgba(220,235,180,0.04)',rx=14,stroke=CARD_BR,sw=1)
        s+=T(x+14,y+24,lab,11,500,MUTED)
        s+=T(x+14,y+46,val,16,700,PAPER)
    # nutrition goals
    s+=T(PAD,486,'Nutrition Goals',15,600,PAPER)
    s+=card(PAD,504,CW,150)
    goals=[('Calories','2200 kcal',LIME),('Protein','150 g',PROTEIN),('Carbs','250 g',CARBS),('Fat','70 g',FAT)]
    for i,(lab,val,col) in enumerate(goals):
        y=534+i*30
        s+=C(PAD+26,y-4,4,col)
        s+=T(PAD+40,y,lab,13,400,SUB)
        s+=T(PAD+CW-20,y,val,13,700,PAPER,anchor='end')
    # sign out
    s+=R(PAD,672,CW,54,'rgba(255,107,92,0.10)',rx=27,stroke='rgba(255,107,92,0.4)',sw=1)
    s+=ico('signout',PAD+CW/2-56,689,22,'#FF6B5C',2)+T(PAD+CW/2-26,706,'Sign out',15,700,'#FF6B5C')
    s+=tab_bar(4)
    return s

def scr_community():
    s=R(0,0,W,H,'url(#bg)')+aurora()
    s+=header('Community','Shared daily summaries')
    # sharing toggle
    s+=card(PAD,124,CW,64)
    s+=ico('group',PAD+20,144,24,LIME,2)
    s+=T(PAD+56,152,'Daily summary sharing',13,600,PAPER)
    s+=T(PAD+56,172,'Visible to your group',11,400,MUTED)
    s+=R(PAD+CW-64,146,44,26,'rgba(198,242,78,0.9)',rx=13)+C(PAD+CW-30,159,10,INK)
    # members
    s+=T(PAD,216,'Members',16,600,PAPER)
    members=[('Priya N.','1,540 kcal · shared',True),('Rahul K.','1,210 kcal · shared',True),
             ('Sneha M.','Not sharing today',False),('Vikram R.','1,780 kcal · shared',True)]
    for i,(n,st,on) in enumerate(members):
        y=234+i*66
        s+=R(PAD,y,CW,58,'rgba(220,235,180,0.04)',rx=16,stroke=CARD_BR,sw=1)
        s+=C(PAD+30,y+29,18,'rgba(198,242,78,0.12)')+ico('person',PAD+22,y+21,16,LIME,1.9)
        s+=T(PAD+58,y+24,n,14,600,PAPER)
        s+=T(PAD+58,y+42,st,11,400,LIME if on else MUTED)
        s+=ico('chev',PAD+CW-30,y+20,18,MUTED,2)
    s+=home_indicator()
    return s

SCREENS=[('01-login',scr_login,False),('02-onboarding',scr_onboarding,False),
         ('03-home',scr_home,True),('04-diary',scr_diary,False),
         ('05-nutrition',scr_nutrition,True),('06-progress',scr_progress,True),
         ('07-activity',scr_activity,True),('08-profile',scr_profile,True),
         ('09-community',scr_community,False)]

def wrap(body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="430" height="884" viewBox="0 0 430 884" '
            f'style="background:#0a0c08;font-family:{FONT}">'
            f'{defs()}'
            f'{R(10,10,410,864,"#05060a",rx=58,stroke="#2b2e22",sw=1.5)}'
            f'<clipPath id="scr"><rect x="20" y="20" width="{W}" height="{H}" rx="48"/></clipPath>'
            f'<rect x="20" y="20" width="{W}" height="{H}" rx="48" fill="url(#bg)"/>'
            f'<g clip-path="url(#scr)"><g transform="translate(20,20)">{status_bar()}{body}</g></g>'
            f'{R(188,24,54,10,"#000",rx=5)}'
            f'</svg>')

def write_all():
    for name,fn,_ in SCREENS:
        svg=wrap(fn())
        with open(os.path.join(OUT,name+'.svg'),'w') as f: f.write(svg)
    write_overview()
    print('wrote', len(SCREENS),'screens + overview')

def write_overview():
    cols,rows=3,3; cw,ch=126,262; gapx,gapy=26,30; ox,oy=40,120
    totalW=cols*cw+(cols-1)*gapx+2*ox
    totalH=rows*ch+(rows-1)*gapy+oy+40
    body=''
    for i,(name,fn,tabbed) in enumerate(SCREENS):
        r,c=divmod(i,cols)
        x=ox+c*(cw+gapx); y=oy+r*(ch+gapy)
        inner=status_bar()+fn()
        body+=(f'<g transform="translate({x},{y}) scale({cw/430})">'
               f'<rect x="0" y="0" width="430" height="884" rx="34" fill="#05060a" stroke="#2b2e22"/>'
               f'<clipPath id="c{i}"><rect x="8" y="8" width="414" height="868" rx="28"/></clipPath>'
               f'<rect x="8" y="8" width="414" height="868" rx="28" fill="url(#bg)"/>'
               f'<g clip-path="url(#c{i})"><g transform="translate(8,8)">{inner}</g></g></g>')
        body+=T(x+cw/2,y+ch+18,name.split('-',1)[1].capitalize(),12,600,'#4A4F42',anchor='middle')
    head=(T(ox,56,'NutriTrack',30,800,'#14170E',ls=-0.6)
          +T(ox,82,'Eat Better. Live Healthier.  ·  App UI',14,500,'#4A4F42')
          +R(totalW-150,40,110,34,'#C6F24E',rx=17)
          +T(totalW-95,63,'Ink & Lime',12,700,'#0E100B',anchor='middle'))
    svg=(f'<svg xmlns="http://www.w3.org/2000/svg" width="{totalW}" height="{totalH}" viewBox="0 0 {totalW} {totalH}" '
         f'style="background:#F5F5F0;font-family:{FONT}">{defs()}{head}{body}</svg>')
    with open(os.path.join(OUT,'00-overview.svg'),'w') as f: f.write(svg)

if __name__=='__main__':
    write_all()
