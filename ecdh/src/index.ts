import { createCipheriv, createDecipheriv, createECDH } from 'crypto'
import { Readable } from 'stream'

import readStream from './read-stream.js'

const CURVE = 'secp256k1'

const MY_PRIVATE_KEY = '56004fe46a2ca3d3068757bce8794a6608d5a40a2aa9bdf6f7510a2403eeb81a'
const MY_PUBLIC_KEY = '047f4b8bc388cda85c50bb7d614c9bafe65dea42560ee0de35cdb3a4718641b125c54781b97e00522334894bf69926aab59e2c8df6f4192b97ca84e2e4a6b01aef'

const FRIENDS_PUBLIC_KEY =
  '0433b15bb41d0ff52d754ce1b60e5dfa2dbab0d4e606879787eb32067b1c0bc12b320657a03b0dd5fe2ae486b90880f818d3c8fcffe879a374f3d6eb318789897b'

const encryptMessage = async (message: string): Promise<Buffer> => {
  const me = createECDH(CURVE)
  me.setPrivateKey(Buffer.from(MY_PRIVATE_KEY, 'hex'))

  const secret = me.computeSecret(Buffer.from(FRIENDS_PUBLIC_KEY, 'hex'))

  const cipher = createCipheriv('aes-256-ctr', secret, Buffer.alloc(16))
  const input = Readable.from(Buffer.from(message, 'utf8'), {
    objectMode: false,
  })
  const encryptedMessage = await readStream(input.pipe(cipher))

  return encryptedMessage
}

const decryptMessage = async (encryptedMessage: Buffer): Promise<string> => {
  const me = createECDH(CURVE)
  me.setPrivateKey(Buffer.from(MY_PRIVATE_KEY, 'hex'))

  const secret = me.computeSecret(Buffer.from(FRIENDS_PUBLIC_KEY, 'hex'))

  const cipher = createDecipheriv('aes-256-ctr', secret, Buffer.alloc(16))
  const input = Readable.from(encryptedMessage, { objectMode: false })
  const message = await readStream(input.pipe(cipher))

  return message.toString('utf8')
}

void (async function () {
  const encryptedMessage = await encryptMessage(`
 
              ░▄▀▒░▀░█▀▄▒▄▀▄░▀▄▀░░░██▄▒█▀▄▒██▀░█▄░█░█▀▄░▄▀▄░█▄░█
              ░▀▄█░░▒█▄▀░█▀█░▒█▒▒░▒█▄█░█▀▄░█▄▄░█▒▀█▒█▄▀░▀▄▀░█▒▀█

              HOW COOL IS THIS? THE GOVT CAN'T SPY ON US NOW.

              > Hey George, what are your plans for this weekend?

              I ain't got not no plans.
              Have you got anything on tomorrow? It would be cool to hang out.


_-.'                                                                                
|?r<!=::::",_'.''  ''                                                               
v|?rr**rr^<;=====+rr~'                                                              
|?rr*|||?r^+!=:==<!'                                                                
r^^r?||\\\|?r^>>~.                                                  ' =006ax='      
+>r*?|||\\\v\?*=                                                      !gB@@@BgR6H6Af
^*|||???***||r.                                                         ._<1QBBBBBBg
^?|||?*r^^>^!                                       '._'_              _Zz> =&08gQQQ
!>rr??*r^><:'                                       .+?r^_' _?>,'       :1Y\IKUAW6dE
"=!+^^^>++=_                               .!=-'   =r\*r;,.=v\+^r:       iooaoohPAWW
_,:=!!!===:'                            ''   ',:+*}{x|\||r?v\vY1L?"      *oosIIIIoff
__":====:=:                            =,;~+^|1IfhfhosIuYuwwhKKho1|=     lFFItJzzzJI
:::======!=                           :!=1}JhAER&088&6AAqGAWddWAKfFL     }uzuu11111u
!~;++++;~~=                           ?\vx|TIooIwutsfGW6d6H6DDdWGZhw     \L}YYY}{{YT
rrrrrr^^><:                      =   "v1|~+r>:-''-'--,;vIPWWhzL?~=:='   '|vvvxLLLLL{
***rr>>^^<+_                     ':|1u?r|iLxr?r,:\+'~*}IqE6t+.       '.'!r|||\vvixLL
r**^^+;+^^^>-                     {IZqWHPhhhhhKaFwlTfh%Dgg6Tx1r;x='  .:*|?*?||||\\\v
r**rr^<++^^^<'                    LaAD0gggg0R6WGfsfqE08gQgHuluz1LT_  =?|||?????****?
rrrrrrr^+++>;=                    |zK6R8QQQQg8RE6$8gggggggEstsFFsf^ =>^^rrrrrrrr^^^^
<>^^^^^+!==!!:,                 -+uIfGD0gQQQgQggggggg80&R0RhIfKZUK?:+++++++<>+<<+++<
:======::":=,_'                _:*zIf%6RggQQQQQQQgR66ERED00EhhU%ZF^~~!!===!~;;;;~!!!
'''_"=+?||?r. '            ''  _r{zIf%6R88gQQQgg0EWZhF{1f6RdZh%qhx!~!!======!!!!====
    '=|1uJz{_            '==!:={usahUA6R08ggQg0$dW%ox*^*|\=:xh%%F^=!!!====::========
     -?YzIoIx-           r\?|vTfGGP%AWHER8gg8R6Uov^r=-.,.-.  :Tfv++><<+!==:",":=====
      =v1uuTL=          .{uT}zFhPGAqqAWH6RR&R6s|r!^\}xL1\~r"  :v>+><>^+~!=:,__,:===!
      =^r|v\~'          >zFILusahU%A%qqqA6ERRAFTLv||iiLLx?="=::!=!;<^>+;~!=:,__,:==;
=,.  '',:==_'          =uafft}lzFfZUGAAAAAAAq%qWHWqUfw1uuT\vix+===!~<>>>++;=:,__"=!>
!:'   '.',:,.'' '     ,uahhhfsTL1IahUGAAWAAAH6W6d6qfwlivvxLYx;===!;<<>>^>+<+=:,,"=+^
_'   '.'-:!=_....-_,-+usfhhhhfIY\i1IahZZqqAH66ED$RR$dWGKfI1v;!~~;;~+++<<<<+++=::=!+^
      '''_!^;=:_'.''=uoofhhhhfotl||iTtsaffhZ%W66D$RD6W%ZfJv=::::::","""::===:"_'-'.'
'         '!;!:_   <IfhfahKKhhhaszYv??\L1uu1uIfKPqGPZhhaz?'                         
                  .fhhPhafKUG%GUhfIu1L\?*^>^^+!;*\vii\^,                            
                   oPPGPffhUG%AAqUffoIJuYvr~=::=!<r|'                            ':!
                   =%AWAKhZGGGAAAWWAGKfsu1Y{Lvi}11lx,                             ">
                    ^A6WUUUUUPAH6666WA%ZhffoFoaaotuL'                               
                     !qWAWHAGUUqHdEE66WWAA%GPUZhoIz?                                
                      't6R0RdHqAH6666H666Edd6APfoFu:                                
                        rEgg80$EDDEE66dD$R&REWUhfs\                                 
                          !G08g8g80&R088ggg8R6Hqs"                                  
                            'vW0ggg8ggggggg80$G<                                    
                               '+TA8ggggg8RPl!                                      
                                    ._.                                             

                                                `)

  console.log(encryptedMessage.toString('hex'))
  
  // const encryptedMessage = Buffer.from('6b037c09f7ffdf684393535d9ed0a57d6f67715c119ab66dfa2dfe98bfafa9db8017598d51c67b86e22498b3dc9d75fe45', 'hex')

  // const output = await decryptMessage(encryptedMessage)
  // console.log(output)
})()

export {
  encryptMessage,
  decryptMessage,
  MY_PUBLIC_KEY,
}
