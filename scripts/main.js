    let camera, controls, scene, renderer, light
    
    let moveForward = false
    let moveBackward = false
    let moveLeft = false
    let moveRight = false
    let prevTime = performance.now()
    let velocity = new THREE.Vector3()
    let direction = new THREE.Vector3()
    let clock = new THREE.Clock()
    let analyser1

    const init = () =>{

        /**
         * Camera
         */
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 )
        camera.position.set( 0, 25, 0 )

        /**
         * Scene
         */
        scene = new THREE.Scene()
        scene.fog = new THREE.FogExp2( 0xffffff, 0.0025 )

        /**
         * Light
         */
        const light = new THREE.AmbientLight( 0xffffff )
        light.position.set( 0, 0, 1 ).normalize()
        scene.add(light)

        const loadingManager = new THREE.LoadingManager( () => {
	
            const loadingScreen = document.getElementById( 'loading-screen' );

            if( loadingScreen.classList.contains('fade-out') === false)
            {
                loadingScreen.classList.add( 'fade-out' );     
            }
            
            // optional: remove loader from DOM via event listener
            loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
        })

        function onTransitionEnd( event ) {
            event.target.style.display = 'none'
        }
        
        /**
         * Controls
         */
        controls = new THREE.PointerLockControls( camera, document.body )
        const blocker = document.querySelector('#blocker')
        
        document.body.addEventListener( 'keydown', (_e) => {
            if(_e.key === ' ')
            {
                controls.lock()
                blocker.style.display = 'none'	
            }
        },false)

        // document.body.addEventListener( 'touchstart', () => {
        //         controls.lock()
        // })

        scene.add( controls.getObject() )

         /** Controls KeysDown*/

        const onKeyDown =  ( _event ) => {
            if (_event.code === 'KeyW')
            {
                moveForward = true
            }
            if (_event.code === 'KeyS')
            {
                moveBackward = true
            }
            if (_event.code === 'KeyA')
            {
                moveLeft = true
            }
            if (_event.code === 'KeyD')
            {
                moveRight = true
            }
        }
         /** Controls KeyUp*/
         const onKeyUp = ( _event ) =>{
            if (_event.code === 'KeyW')
            {
                moveForward = false
            }
            if (_event.code === 'KeyS')
            {
                moveBackward = false
            }
            if (_event.code === 'KeyA')
            {
                moveLeft = false
            }
            if (_event.code === 'KeyD')
            {
                moveRight = false
            }
        }

        document.addEventListener( 'keydown', onKeyDown )
        document.addEventListener( 'keyup', onKeyUp )
        
         /** Controls Arrow*/

        const upArrow = document.querySelector('.upArrow')
        upArrow.addEventListener('touchstart', () => {
                moveForward = true
        })
        upArrow.addEventListener('touchend',() => {
            moveForward = false
        })

        const downArrow = document.querySelector('.downArrow')
        downArrow.addEventListener('touchstart', () => {
            moveBackward= true
        })
        downArrow.addEventListener('touchend',() => {
            moveBackward = false
        })

        const rightArrow = document.querySelector('.rightArrow')
        rightArrow.addEventListener('touchstart', () => {
            moveRight= true
        })
        rightArrow.addEventListener('touchend',() => {
            moveRight = false
        })

        const leftArrow = document.querySelector('.leftArrow')
        leftArrow.addEventListener('touchstart', () => {
            moveLeft= true
        })
        leftArrow.addEventListener('touchend',() => {
            moveLeft = false
        })

        /**
         * Renderer
         */
        renderer = new THREE.WebGLRenderer( { antialias: true } )
        renderer.setPixelRatio( window.devicePixelRatio )
        renderer.setSize( window.innerWidth, window.innerHeight )
        document.body.appendChild( renderer.domElement )

        /**
         * DomEvents to click on 3d objects
         */
        const domEvents = new THREEx.DomEvents(camera, renderer.domElement)

        /**
         * Ground (floor)
        */
        const geometryGround = new THREE.PlaneGeometry( 1500, 1500, 10 )
        const materialGround = new THREE.MeshBasicMaterial( {map : new THREE.TextureLoader(loadingManager).load('assets/textures/ground.jpg') , side: THREE.DoubleSide} )
        materialGround.map.wrapS = THREE.RepeatWrapping
        materialGround.map.wrapT = THREE.RepeatWrapping
        materialGround.map.repeat.set(30,30)
        const ground = new THREE.Mesh( geometryGround, materialGround )
        ground.rotation.x = Math.PI / 2
        scene.add(ground)

        /**
         * POO section to build the walls
        */
        class Wall{
            constructor(width, x, z, rotationY)
            {
                this.width = width
                this.x = x
                this.z = z
                this.rotationY = rotationY
                this.geometryWall = new THREE.BoxBufferGeometry(this.width,100 ,2)
                this.materialWall = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/paper3.jpg') } )
                this.materialWall.map.wrapS = THREE.RepeatWrapping
                this.materialWall.map.wrapT = THREE.RepeatWrapping
                this.materialWall.map.repeat.set(10,5)
                this.wall = new THREE.Mesh( this.geometryWall, this.materialWall )
                this.position = this.wall.position.set(this.x, 49 , this.z )
                this.wall.rotation.y = this.rotationY
                this.scene = scene.add( this.wall )
            }
        }

        /**  Creation of the walls*/
        const rightSideRightWall = new Wall(350, 250,225, Math.PI / 2)
        const rightSideleftWall = new Wall(350, 250, -225, Math.PI / 2)
        const leftSideRightWall = new Wall(350, -250,225, Math.PI / 2)
        const leftSideleftWall = new Wall(350, -250, -225, Math.PI / 2)
        const frontLeftWAll = new Wall(200, -150, -375,- Math.PI)
        const frontRightWAll = new Wall(200, 150, -375,- Math.PI)
        const backLeftWAll = new Wall(200, -150, 375, - Math.PI)
        const backRightWAll = new Wall(200, 150, 375, - Math.PI)

        /**
         * POO section to build the rooms
        */

       let audioLoader = new THREE.AudioLoader(loadingManager)
   
        class SongRoom{
            constructor(artiste, xWall, yWall, zWall, rotationWall, rotationBuffer, rotationButton, indiceZ, indiceX){
                this.artiste = artiste
                this.xWall = xWall
                this.yWall = yWall
                this.zWall = zWall
                this.rotationWall = rotationWall
                this.rotationBuffer = rotationBuffer
                this.rotationButton = rotationButton
                this.indiceZ = indiceZ
                this.indiceX = indiceX
                this.number = 0
                this.songInfo = {
                    songs : [
                    `assets/songs/${this.artiste}0.mp3`,
                    `assets/songs/${this.artiste}1.mp3`,
                    `assets/songs/${this.artiste}2.mp3`,
                    ],
                    covers : [
                    new THREE.TextureLoader(loadingManager).load(`assets/textures/covers/${this.artiste}0.jpg`),
                    new THREE.TextureLoader(loadingManager).load(`assets/textures/covers/${this.artiste}1.jpg`),
                    new THREE.TextureLoader(loadingManager).load(`assets/textures/covers/${this.artiste}2.jpg`),
                    new THREE.TextureLoader(loadingManager).load(`assets/textures/covers/${this.artiste}3.jpg`),
                    new THREE.TextureLoader(loadingManager).load(`assets/textures/covers/${this.artiste}4.jpg`)
                    ]
                }
                this.creationRoom()
                this.playPauseSong()
                this.nextSong()
                this.previousSong()
                this.volumeUp()
                this.volumeDown()
                this.volumeBar()
                this.audio()
            }
            /** Section of room creation*/
            creationRoom(){
                const geometryRoom = new THREE.BoxBufferGeometry(250,100,250)
                this.materialRoomTab =
                [
                    new THREE.MeshPhongMaterial( { side: THREE.DoubleSide} ),
                    new THREE.MeshPhongMaterial( { map : this.songInfo.covers[this.number] ,side: THREE.DoubleSide, shininess : 5} ),
                    new THREE.MeshPhongMaterial( {side: THREE.DoubleSide} ),
                    new THREE.MeshPhongMaterial( {side: THREE.DoubleSide} ),
                    new THREE.MeshPhongMaterial( { map : this.songInfo.covers[3] ,side: THREE.DoubleSide, shininess : 5} ),
                    new THREE.MeshPhongMaterial( { map : this.songInfo.covers[4] ,side: THREE.DoubleSide, shininess : 5} ), 
                ]
                const materialRoom = new THREE.MeshFaceMaterial(this.materialRoomTab)
                const room =  new THREE.Mesh( geometryRoom,materialRoom)
                room.position.set(this.xWall, this.yWall, this.zWall)
                room.rotation.y = this.rotationWall
                scene.add(room)
                for (let i = 0; i < 6; i++) {
                    room.geometry.index.array[i] =0
                }
                for (let i = 12 ; i < 16; i++) {
                    room.geometry.index.array[i] =0
                }
            }
            /** Section of next button creation*/
            nextSong()
            {
                const geometryNext = new THREE.PlaneGeometry( 20, 20, 20 )
                const matrialNext = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/buttons/next.png') ,side: THREE.DoubleSide, transparent: true} )
                this.next =  new THREE.Mesh(geometryNext, matrialNext)
                this.next.rotation.y = this.rotationButton
                this.next.position.set(this.xWall +  ( 75  * this.indiceZ) + (124 * this.indiceX) ,  this.yWall  , this.zWall - (124 * this.indiceZ) + (75 * this.indiceX))
                scene.add(this.next)
            }
            /** Section of previous button creation*/
            previousSong()
            {
                const geometryPrevious = new THREE.PlaneGeometry( 20, 20, 20 )
                const matrialPrevious = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/buttons/previous.png') ,side: THREE.DoubleSide, transparent: true} )
                this.previous =  new THREE.Mesh(geometryPrevious, matrialPrevious)
                this.previous.rotation.y = this.rotationButton
                this.previous.position.set(this.xWall -  ( 75  * this.indiceZ) + (124 * this.indiceX) ,  this.yWall  , this.zWall - (124 * this.indiceZ) - (75 * this.indiceX))
                scene.add(this.previous)
            }
            /** Section of play and pause button creation*/
            playPauseSong()
            {
                this.pngPlayPause = [
                'assets/textures/buttons/pause.png',
                'assets/textures/buttons/play.png'
                ]
                const geometryPlayPause = new THREE.PlaneGeometry( 20, 20, 20 )
                const matrialPlayPause = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/buttons/play.png') ,side: THREE.DoubleSide, transparent: true} )
                this.playPause =  new THREE.Mesh(geometryPlayPause, matrialPlayPause)
                this.playPause.rotation.y = this.rotationButton
                this.playPause.position.set(this.xWall - ( -124 * this.indiceX ) ,  this.yWall  , this.zWall - (124  * this.indiceZ) )
                scene.add(this.playPause)
            }
            /** Section of volume up button creation*/
            volumeUp()
            {
                const geometryVolumeUp = new THREE.PlaneGeometry( 10, 10, 10 )
                const matrialVolumeUp = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/buttons/volumeUp.png') ,side: THREE.DoubleSide, transparent: true} )
                this.volumeUp =  new THREE.Mesh(geometryVolumeUp, matrialVolumeUp)
                this.volumeUp.rotation.y = this.rotationButton
                this.volumeUp.position.set(this.xWall +  ( 45  * this.indiceZ) + (124 * this.indiceX) ,  this.yWall - 25  , this.zWall - (124 * this.indiceZ) + (45 * this.indiceX))
                scene.add(this.volumeUp)
            }
            /** Section of volume down button creation*/
            volumeDown()
            {
                this.pngVolumeDown = [
                'assets/textures/buttons/volumeDown.png',
                'assets/textures/buttons/volumeStop.png'
                ]
                const geometryVolumeDown = new THREE.PlaneGeometry( 10, 10, 10 )
                const matrialVolumeDown = new THREE.MeshBasicMaterial( { map : new THREE.TextureLoader(loadingManager).load('assets/textures/buttons/volumeDown.png') ,side: THREE.DoubleSide, transparent: true} )
                this.volumeDown =  new THREE.Mesh(geometryVolumeDown, matrialVolumeDown)
                this.volumeDown.rotation.y = this.rotationButton
                this.volumeDown.position.set(this.xWall -  ( 45  * this.indiceZ) + (124 * this.indiceX) ,  this.yWall - 25  , this.zWall - (124 * this.indiceZ) - (45 * this.indiceX))
                scene.add(this.volumeDown)
            }
            /** Section of volume bar button creation*/
            volumeBar()
            {
                this.volumeBars = []
                const geometryVolumeBar = new THREE.SphereGeometry( 5, 40, 40 )
                const matrialVolumeBar = new THREE.MeshBasicMaterial( { color : 0x151515 } )
                for (let i = 0; i < 51; i++) {
                        const volumeBar =  new THREE.Mesh(geometryVolumeBar, matrialVolumeBar)
                        volumeBar.rotation.y =  this.rotationButton
                        volumeBar.position.set(this.xWall - ( this.indiceZ * 30 ) + (  this.indiceZ * i) + (this.indiceX * 127),  this.yWall - 25  , this.zWall - ((30 * this.indiceX) - ( this.indiceX * i )) - (this.indiceZ * 127) )
                        if ( i > 24 & i < 51){
                            volumeBar.visible = false
                        }
                        scene.add(volumeBar)
                        this.volumeBars.push(volumeBar)
                }
            }
            /** Section of speaker audio creation*/
            audio()
            {
                const geometryAudio = new THREE.BoxBufferGeometry( 50, 10, 20 )
                const materialAudio = new THREE.MeshBasicMaterial( { transparent: true, opacity :0 } )
                const speakerAudio  = new THREE.Mesh(geometryAudio ,materialAudio)
                speakerAudio.rotation.y = this.rotationBuffer
                speakerAudio .position.set( this.xWall + ( -125 *this.indiceX)  , this.yWall + 40, this.zWall + ( 125 * this.indiceZ))
                scene.add(speakerAudio)

                /** Section of audio listener creation*/
                const listener = new THREE.AudioListener()
                camera.add(listener)
                let sound = []
                for (let i = 0; i < this.songInfo.songs.length ; i++) {
                    sound[i] = new THREE.PositionalAudio(listener)
                }
                /** Section of song parametre creation*/
                let songVolume = 25
                const parameterSong = () =>
                {
                    sound[this.number].setVolume(songVolume)
                    sound[this.number].setRefDistance(1)
                    sound[this.number].setDirectionalCone( 180, 0, 0.1 )
                    sound[this.number].setMaxDistance(0.1)
                    sound[this.number].play()
                    speakerAudio.add(sound[this.number])
                }
                /** Section of load song*/
                audioLoader.load(`${this.songInfo.songs[this.number]}`,
                (buffer) => {
                    sound[this.number].setBuffer(buffer)
                    parameterSong()
                })

                /** Section of  click on next button listener*/
                domEvents.addEventListener(this.next, 'click', _e =>
                {
                    if(this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[0]}`)){
                        this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[1]}`) 
                    }
                    sound[this.number].stop()
                    this.number++
                    if (this.number === 3){
                        this.number = 0
                    }

                    this.materialRoomTab[1] = new THREE.MeshPhongMaterial( { map : this.songInfo.covers[this.number] ,side: THREE.DoubleSide} )

                    if ( this.number % 3 === 0){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                    }
                    else if ( this.number % 3 === 1){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                    }
                    else if ( this.number % 3 === 2){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                       
                    }
                })

            /** Section of  click on previos button listener*/
            domEvents.addEventListener(this.previous, 'click', _e =>
                {
                    if(this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[0]}`)){
                        this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[1]}`) 
                    }
                    sound[this.number].stop()
                    this.number--
                        if (this.number === -1)
                        {
                        this.number = 2
                        }

                    if (this.number === 3) {
                        this.number = 0
                    }
                    this.materialRoomTab[1] = new THREE.MeshPhongMaterial( { map : this.songInfo.covers[this.number] ,side: THREE.DoubleSide} )

                    if ( this.number % 3 === 0){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                    }
                    else if ( this.number % 3 === 1){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                    }
                    else if (this.number % 3 === 2){
                        audioLoader.load(`${this.songInfo.songs[this.number]}`,
                        (buffer) => {
                            sound[this.number].setBuffer(buffer)
                            parameterSong()
                        })
                    }
                })

            /** Section of  click on play and pause button listener*/
            domEvents.addEventListener(this.playPause, 'click', _e =>
                {
                    if( sound[this.number].isPlaying === true){
                        this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[0]}`) 
                         sound[this.number].pause()
                    }
                    else if ( sound[this.number].isPlaying === false){
                        this.playPause.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngPlayPause[1]}`) 
                         sound[this.number].play()
                    }
                })

                /** Section of  click on volume up button listener*/ 
                domEvents.addEventListener(this.volumeUp, 'click', _e =>
                {
                    this.volumeDown.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngVolumeDown[0]}`) 
                    songVolume++
                    if (songVolume > 50)
                    {
                        songVolume = 50
                    }
                    this.volumeBars[songVolume].visible = true

                    for (let i = 0; i < sound.length; i++) {
                        sound[i].setVolume(songVolume)
                        }
                    })

                /** Section of  click on volume down button listener*/ 
                domEvents.addEventListener(this.volumeDown, 'click', _e =>
                {
                    this.volumeBars[songVolume].visible = false
                    songVolume--
                    if (songVolume < 0)
                    {
                        songVolume = 0
                        this.volumeDown.material.map = new THREE.TextureLoader(loadingManager).load(`${this.pngVolumeDown[1]}`) 
                    }
                    for (let i = 0; i < sound.length; i++)
                    {
                        sound[i].setVolume(songVolume)
                    }
                })
            }
        }

        /**  Creation of the Artists*/
        const PNL = new SongRoom('PNL', 0, 49, -500, -Math.PI / 2, Math.PI, 0, 1, 0)
        const TUPAC = new SongRoom('TUPAC', 0, 49, 500, Math.PI / 2, Math.PI * 2, Math.PI, -1, 0)
        const SHAKIRA = new SongRoom('SHAKIRA', 375, 49, 0, -Math.PI, Math.PI / 2, - Math.PI / 2, 0, 1)
        const RIHANNA = new SongRoom('RIHANNA', -375, 49, 0, 0, Math.PI / -2, Math.PI / 2, 0, -1)

        /**
         * Listener on window Resize
        */
        window.addEventListener( 'resize', onWindowResize, false )

        /**
         * call animate function
        */
        animate()
    }

    /**
     *  Function on window resize
    */
    const onWindowResize = () => {

        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize( window.innerWidth, window.innerHeight )
    }

    /**
     *  Function animate
    */
    const animate = () => {

        requestAnimationFrame( animate )

        /**
         *  Get the the preformance time to creat a velocity
        */
        const time = performance.now()
        const delta = ( time - prevTime ) / 1000

        velocity.x -= velocity.x * 10.0 * delta
        velocity.z -= velocity.z * 10.0 * delta
        
        /**
         *   Creat a variable to have the axe of direction  exp : if direction x === -1 the locker go left 
        */
        direction.z = Number( moveForward ) - Number( moveBackward )
        direction.x = Number( moveRight ) - Number( moveLeft )
        direction.normalize()

        /**
         *   Applicate the velocity for direction
        */
        if ( moveForward || moveBackward )
        {
            velocity.z -= direction.z * 1000.0 * delta
        }
        if ( moveLeft || moveRight ) 
        {
            velocity.x -= direction.x * 1000.0 * delta
        }

        /**
         *   Get the controls position and the mouse is picking whit Vector3 
        */
        let originPoint = controls.getObject().position
        let mouse3D = new THREE.Vector3()
        mouse3D.normalize()
        controls.getDirection( mouse3D )

        /**
         *   the origin of the ray in Vector and the direction of the vector
        */
        let ray = new THREE.Raycaster( originPoint, controls.getDirection(mouse3D))
          
        /**
         *   all of this to create collsion between the locker (player) and the scene children ( geaometry add to the scene)
        */
        let collisionResults = ray.intersectObjects(scene.children)
        
        /**
         *   the codition of colision
        */
    
    
        if ( collisionResults.length > 0 && collisionResults[0].distance < controls.getObject().position.y) {
                if (moveForward === true && direction.z === 1 ) {
                moveForward = false
                velocity.z =  Math.max( 150)
            }
            if (moveBackward === true && direction.z === -1 ) {
                moveBackward = false
                velocity.z =  Math.min( -150 )
            }
             if( moveRight === true && direction.x === 1 )
                {
                    moveRight = false
                    velocity.x =  Math.min(150 )
                }
             if( moveLeft === true && direction.x === -1)
            {
                moveLeft = false
                velocity.x =  Math.max(-150 )
            }

        }

        /**
         *  Aplicate the controls and velocity together
        */
        controls.moveRight( - velocity.x * delta )
        controls.moveForward( - velocity.z * delta )
        controls.moveRight( - velocity.x * delta )
        controls.moveForward( - velocity.z * delta )

        prevTime = time

        renderer.render( scene, camera )
    }

        window.addEventListener('DOMContentLoaded', () => {
                init()
         })