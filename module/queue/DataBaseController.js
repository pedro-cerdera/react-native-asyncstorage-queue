/* eslint-disable no-console */
import { AsyncStorage } from 'react-native';
// import Realm from 'realm';

const JobSchema = {
    name: 'Job',
    primaryKey: 'id',
    properties: {
        id: 'string', // UUID.
        name: 'string', // Job name to be matched with worker function.
        payload: 'string', // Job payload stored as JSON.
        data: 'string', // Store arbitrary data like "failed attempts" as JSON.
        priority: 'int', // -5 to 5 to indicate low to high priority.
        active: { type: 'bool', default: false }, // Whether or not job is currently being processed.
        timeout: 'int', // Job timeout in ms. 0 means no timeout.
        created: 'date', // Job creation timestamp.
        failed: 'date?' // Job failure timestamp (null until failure).
    }
};

class DataBaseController {

    get TAG() {
        return 'Queue DataBaseController';
    }

    async write(scheme, jobList) {
        try {
            await AsyncStorage.setItem(scheme, JSON.stringify(jobList));
            return true;
        } catch (e) {
            console.log(this.TAG, e);
            return false;
        }
    }

    async objects(scheme) {
        let jobs = [];

        try {
            jobs = await AsyncStorage.getItem(scheme);
            if (jobs) {
                jobs = JSON.parse(jobs);
            }
        } catch (e) {
            console.log(this.TAG, e);
        }

        return jobs;
    }

    async delete(scheme, job) {
        try {
            if (job) {
                const jobList = await this.objects(scheme);
                if (jobList && jobList.length > 0) {
                    const indexToRemove = jobList.indexOf(job);
                    jobList.splice(indexToRemove, 1);
                    return await this.create(scheme, jobList);
                }
            }
        } catch (e) {
            console.log(this.TAG, e);
        }

        return false;
    }

    async deleteAll(scheme) {
        console.log(this.TAG, 'delete all...');
        try {
            await AsyncStorage.removeItem(scheme);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = new DataBaseController();
