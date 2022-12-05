class Player {
    constructor(x, y, w, h, asset, category, mask, world) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.asset = asset;
        this.world = world;
        this.category = category;
        this.mask = mask;
        this.body;
        this.lookAt = 0;
        this.gun = 0;
        this.hand;

        this.prevDir = 0;

        this.draw();
    };

    draw() {
        if (this.category == CATEGORY_PLAYER) {
            this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, {
                collisionFilter: {  category: this.category, mask: this.mask}, 
                density: 0.05, 
                frictionAir: 0.8, 
                isStatic: false , 
                render: { sprite: { texture: this.asset }}
                });
            Composite.add(this.world, this.body);
            Body.setAngle(this.body, Math.PI/2);
            this.lookAt =  Math.PI/2;
        }
        else {
            this.body = Bodies.circle(this.x, this.y, this.w/2, {
                collisionFilter: {  category: this.category, mask: this.mask}, 
                density: 0.01, 
                frictionAir: 0.2, 
                restitution: 0.0,
                isStatic: false , 
                render: { sprite: { texture: this.asset }}
                });
            Composite.add(this.world, this.body);
            Body.setAngle(this.body, Math.PI/2);
            this.lookAt =  Math.PI/2;
        }


    };

    move(x, y) {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
            }, {x: x, y: y})
    };

    moveRandom() {
        var collisionArray = getCollisionArray(CATEGORY_WALLMAP, this.category);
        var collisionArray2 = getCollisionArray(CATEGORY_DYNMAP, this.category);
        if (collisionArray.length > 0 || collisionArray2.length > 0){
            if (this.prevDir < 3)  {
                this.prevDir ++;
            }
            else {
                this.prevDir = 0;
            }
        }

        var f  = 0.2;
        if (this.prevDir == 0) {
            this.moveRight(f);
            this.setLookAt(Math.PI/2);
        }
        else if (this.prevDir == 1){
            this.moveLeft(f);
            this.setLookAt(3*Math.PI/2);
        }
        else if (this.prevDir == 2){
            this.moveUp(f);
            this.setLookAt(0);
        }
        else if (this.prevDir == 3){
            this.moveDown(f);
            this.setLookAt(Math.PI);
        }

    };

    moveRight(f = 1) {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
            }, {x: f, y: 0})
    }

    moveLeft(f = 1) {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
            }, {x: -f, y: 0})
    }

    moveUp(f = 1) {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
            }, {x: 0, y: -f})
    }

    moveDown(f = 1) {
        Matter.Body.applyForce(this.body, {
            x: this.body.position.x,
            y: this.body.position.y
            }, {x: 0, y: f})
    }


    rotate() {
        Body.setAngle(this.body, this.lookAt);
        if (this.gun != 0) {
            this.gun.rotate(this.lookAt);
        }
    };

    setLookAt(angle) {
        this.lookAt = angle;
        this.rotate();
    }

    pickGun(gunType) {
        if (this.gun != 0) {
            return;
        }

        var ox = (Math.cos(this.lookAt - Math.PI/2) * 30);
        var oy = (Math.sin(this.lookAt - Math.PI/2) * 30);
        if (Math.abs(ox) > Math.abs(oy)) {
            oy += 15;
        }
        else {
            ox += 15;
        }
        this.gun = new Gun(this.body.position.x + ox, this.body.position.y + oy, 8, 32, gunType, this.lookAt, this.world);
        this.hand = Constraint.create({
            bodyA: this.body,
            pointA: {x : ox, y: oy},
            bodyB: this.gun.body,
            pointB: {x : 0, y: 0},
            stiffness: 0.1,
            damping: 0.1,
            render: {
                visible: false
            }
        });
        Composite.add(this.world, this.hand);
    }

    dropGun() {
        Composite.remove(this.world, this.hand);
        this.gun.throw();
        this.gun = 0;
    }

    shoot() {
        if (this.gun != 0) {
            this.gun.shoot();
        }
    };

    reload() {
        if (this.gun != 0) {
            this.gun.reload();
        }
    }

    getLastBullet() {
        if (this.gun != 0 && this.gun.getNbBullet() > 0) {
            return this.gun.bullet;
        }
        return new Array(0);
    }

    getAmmoLeft() {
        if (this.gun != 0) {
            return this.gun.ammoLeft;
        }
        return 0;
    }

    getAmmoCapacity() {
        if (this.gun != 0) {
            return this.gun.ammoCapacity;
        }
        return 0;
    }

    getRelativePos(padding) {
        return Matter.Vector.create(padding.x, padding.y);
    }

    isArmed() {
        if (this.gun != 0) {
            return true;
        }
        return false;
    }
}