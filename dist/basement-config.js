export const basementRooms=[['Entire basement',52,28],['Game / media room',45,23],['Basement office',35,7],['Bedroom 5',66,14],['Bedroom 4',66,42],['Basement bathroom',69,28],['Mechanical / gear storage',43,48],['Stair landing',45,39],['Bedroom 5 closet',69,22],['Bedroom 4 closet',69,34],['Under-stair storage',46,35]];
export const basementHull=[[28,0],[58,0],[58,4],[74,4],[74,18.5],[76,18.5],[76,34.5],[74,34.5],[74,52],[58,52],[58,56],[28,56]];
export const basementObjects=[
{id:'b-office-desk',name:'Office desk',type:'table',x:35,z:3,w:5,d:2.5,h:2.5,rotation:0},
{id:'b-media-sofa',name:'Media room sofa',type:'sofa',x:50,z:12,w:9,d:3.5,h:2.7,rotation:0},
{id:'b-media-table',name:'Media coffee table',type:'table',x:50,z:8.5,w:4,d:2.3,h:1.25,rotation:0},
{id:'b-media-screen',name:'Media screen',type:'screen',x:50,z:1.3,w:7.5,d:.12,h:4.22,y:3,rotation:0},
{id:'b-game-table',name:'Game table',type:'gameTable',x:36,z:24,w:4.5,d:8,h:2.6,rotation:0},
{id:'b-bed5',name:'Bedroom 5 bed',type:'bed',x:65.5,z:8.8,w:5,d:6.67,h:2,rotation:180},
{id:'b-bed4',name:'Bedroom 4 bed',type:'bed',x:65.5,z:47.4,w:5,d:6.67,h:2,rotation:0},
{id:'b-vanity',name:'Basement double vanity',type:'vanity',x:65.9,z:26.1,w:6,d:2,h:2.9,rotation:180},
{id:'b-toilet',name:'Basement toilet',type:'toilet',x:70.4,z:26.7,w:1.5,d:2.5,h:2.4,rotation:180},
{id:'b-shower',name:'Basement shower',type:'shower',x:73.5,z:28.08,w:3,d:6,h:7,rotation:0},
{id:'b-closet5',name:'Bedroom 5 wardrobe',type:'cabinet',x:70,z:23.75,w:9,d:1.7,h:7,rotation:0},
{id:'b-closet4',name:'Bedroom 4 wardrobe',type:'cabinet',x:69,z:35.8,w:7,d:1.7,h:7,rotation:0},
{id:'b-gear-rack',name:'Gear shelves',type:'shelves',x:30,z:48,w:2,d:8,h:7,rotation:0}
];
export const basementLights=[[34,6],[40,6],[34,17],[34,28],[42,17],[42,27],[50,5],[50,16],[53,26],[66,9],[69,16],[68,22],[65,28],[73,28],[68,34],[66,41],[69,48],[45,39],[33,42],[33,50],[44,49],[52,49],[45,35]].map(([x,z],i)=>({id:'b-light-'+(i+1),name:'Basement light '+(i+1),type:'recessed',x,z,y:0,kelvin:3000,power:800,on:true}));
export const basementOpenings=[
 {id:'D',x:28.479,z:6,w:4,h:4,sill:8/3,axis:'z',thickness:1.042},
 {id:'D',x:28.479,z:16,w:4,h:4,sill:8/3,axis:'z',thickness:1.042},
 {id:'D',x:73.521,z:11.5,w:4,h:4,sill:8/3,axis:'z',thickness:1.042},
 {id:'D',x:73.521,z:43.25,w:4,h:4,sill:8/3,axis:'z',thickness:1.042},
 ...[
  ['6',40.531,13.354,3.125,'x'],['7',33.433,32.896,6.125,'x'],['6',38.02,39.354,3.125,'z'],
  ['4',44.75,32.98,2.875,'x'],['6',59.99,21.104,3.125,'x'],['6',59.99,34.896,3.125,'x'],
  ['4',66.52,19.312,2.875,'x'],['4',66.52,36.896,2.875,'x'],['1',62.23,22.98,2.625,'z'],
  ['1',62.23,33.10,2.625,'z'],['3',62.23,29.51,2.625,'z']
 ].map(([id,x,z,w,axis])=>({id,x,z,w,h:20/3,axis,door:true,thickness:.45}))
];
