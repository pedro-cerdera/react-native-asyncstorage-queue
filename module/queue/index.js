/**
 * @author FalaFreud Inc., Haroldo Shigueaki Teruya <haroldo.s.teruya@gmail.com>
 * @version 1.0.0
 */

//==========================================================================
// IMPORTS

/**
 * This class requires:
 * @class
 * @requires DataBase
 */
import DataBase from './DataBase';

//==========================================================================
/**
 * @class
 * @classdesc
 */
class QueueManager {

    /**
     * Creates a instance of QueueManager.
     */
    constructor() {
        this.status = this.Status.INACTIVE;
        this.worker = null;
        this._jobList = [];
    }

    //==========================================================================
    // GETTERS

    get TAG() {
        return 'Queue Manager';
    }

    get Status() {
        return {
            INACTIVE: 0,
            ACTIVE: 1
        };
    }

    get jobList() {
        return this._jobList;
    }

    //==========================================================================
    // METHODS

    async init() {
        this._jobList = await DataBase.objects('Job');
    }

    setCallback(callback) {
        this.worker = callback;
    }

    async createJob(payload, autoStart = false) {
        this._jobList.push(payload);

        const success = await DataBase.write('Job', this._jobList);

        if (success && this.status === this.Status.INACTIVE && autoStart) {
            await this.start();
        }
    }

    async start() {
        if (this.status === this.Status.ACTIVE) {
            return;
        }

        this.status = this.Status.ACTIVE;


        while (this.status === this.Status.ACTIVE && this._jobList.length) {
            let job = await this.getNextJob();

            if (job) {
                const success = await this.worker(job);
                
                if (success) {
                    await this.flushJob(job);
                } else {
                    this.setJobInactive(job);
                }
            } else {
                this.status = this.Status.INACTIVE;
                return;
            }
        }

        this.status = this.Status.INACTIVE;
    }

     getNextJob() {
        for(let i = 0; i < this._jobList.length; i++) {
            if (this._jobList[i].active) {
                return this._jobList[i];
            }
        }
        return null;
    }

    stop() {
        this.status = this.Status.INACTIVE;
    }

    async setJobInactive(job) {
        const index = this._jobList.indexOf(job);
        this._jobList[index] = {
            ...this._jobList[index],
            active: false
        };
        return await DataBase.write('Job', this._jobList);
    }

    async flushJob(job) {
        const indexToRemove = this._jobList.indexOf(job);
        this._jobList.splice(indexToRemove, 1);
        return await DataBase.write('Job', this._jobList);
    }

    async flushQueue() {
        this._jobList = [];
        return await DataBase.deleteAll('Job');
    }
}

//==========================================================================
// EXPORTS

/**
 * @module
 */
module.exports = new QueueManager();
