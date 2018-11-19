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
        this.jobList = [];
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

    get getJobList() {
        return this.jobList;
    }

    //==========================================================================
    // METHODS

    async init() {
        console.log(this.TAG, DataBase);
        this.jobList = await DataBase.objects('Job');
    }

    setCallback(callback) {
        this.worker = callback;
    }

    async createJob(payload, autoStart = false) {
        console.log(this.TAG, 'createJob autoStart:', autoStart);
        this.jobList.push(payload);
        console.log(this.TAG, DataBase);
        const success = await DataBase.write('Job', this.jobList);

        console.log(this.TAG, 'createJob success:', success, this.jobList);

        if (success && this.status === this.Status.INACTIVE && autoStart) {
            await this.start();
        }
    }

    async start() {
        console.log(this.TAG, 'start...', this.status ? 'active' : 'inactive');

        if (this.status === this.Status.ACTIVE) {
            return;
        }

        this.status = this.Status.ACTIVE;


        while (this.status === this.Status.ACTIVE && this.jobList.length) {

            console.log(this.TAG,
                'runnable:', this.status === this.Status.ACTIVE,
                'jobList length:', this.jobList.length
            );

            let job = await this.getNextJob();

            if (job) {
                const success = await this.worker(job);
                console.log(this.TAG, 'worked:', success);

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
        for(let i = 0; i < this.jobList.length; i++) {
            if (this.jobList[i].active) {
                return this.jobList[i];
            }
        }
        return null;
    }

    stop() {
        this.status = this.Status.INACTIVE;
    }

    async setJobInactive(job) {
        const index = this.jobList.indexOf(job);
        this.jobList[index] = {
            ...this.jobList[index],
            active: false
        };
        return await DataBase.write('Job', this.jobList);
    }

    async flushJob(job) {
        const indexToRemove = this.jobList.indexOf(job);
        this.jobList.splice(indexToRemove, 1);
        return await DataBase.write('Job', this.jobList);
    }

    async flushQueue() {
        this.jobList = [];
        return await DataBase.deleteAll('Job');
    }
}

//==========================================================================
// EXPORTS

/**
 * @module
 */
module.exports = new QueueManager();
