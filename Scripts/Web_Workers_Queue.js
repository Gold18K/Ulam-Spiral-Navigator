
export class Web_Workers_Queue {

    // Constructor
    constructor(_number_of_workers, _on_message) {
        this.#number_of_workers = _number_of_workers;
        this.#jobs            = [];
        this.#workers         = [];

        for (let i = 0; i != _number_of_workers; ++i)
            this.#workers.push(new Worker('Scripts/Section_Generator.js'));

        for (let i = 0; i != _number_of_workers; ++i) {
            this.#workers[i].onmessage = (_event) => {
                _on_message(_event);

                Web_Workers_Queue.#free_worker(this, _event.data.id);
                Web_Workers_Queue.#check_available_job(this);
            };
        }
        
        this.#current_jobs          = Array.from({ length: _number_of_workers }, () => null);
        this.#avaliable_workers_IDs = [];

        for (let i = 0; i != _number_of_workers; ++i)
            this.#avaliable_workers_IDs.push(i);

        this.#on_message = _on_message;
    }

    // Functions
    send_job(_job) { 
        const worker_ID = this.#avaliable_workers_IDs.pop();

        if (worker_ID === undefined) {
            this.#jobs.push(_job);
            return;
        }

        this.#workers[worker_ID].postMessage({
            id:   worker_ID,
            work: _job
        });

        this.#current_jobs[worker_ID] = _job;
    }
    terminate_workers() {

        for (let i = 0; i != this.#number_of_workers; ++i)
            this.#workers[i].terminate();

        this.#jobs    = [];
        this.#workers = [];

        for (let i = 0; i != this.#number_of_workers; ++i)
            this.#workers.push(new Worker('Scripts/Section_Generator.js'));

        for (let i = 0; i != this.#number_of_workers; ++i) {
            this.#workers[i].onmessage = (_event) => {
                this.#on_message(_event);

                Web_Workers_Queue.#free_worker(this, _event.data.id);
                Web_Workers_Queue.#check_available_job(this);
            };
        }

        this.#current_jobs          = Array.from({ length: this.#number_of_workers }, () => null);
        this.#avaliable_workers_IDs = [];

        for (let i = 0; i != this.#number_of_workers; ++i)
            this.#avaliable_workers_IDs.push(i);
    
    }
    change_number_of_workers(_new_number_of_workers) {

        if (this.#number_of_workers === _new_number_of_workers)
            return;

        if (this.#number_of_workers < _new_number_of_workers) {

            for (let i = this.#number_of_workers; i != _new_number_of_workers; ++i) {
                this.#avaliable_workers_IDs.push(i);
                this.#workers.push(new Worker('Scripts/Section_Generator.js'));
                
                this.#workers[i].onmessage = (_event) => {
                    this.#on_message(_event);
    
                    Web_Workers_Queue.#free_worker(this, _event.data.id);
                    Web_Workers_Queue.#check_available_job(this);
                };

                Web_Workers_Queue.#check_available_job(this);
            }

        }

        if (this.#number_of_workers > _new_number_of_workers) {

            for (let i = this.#number_of_workers - 1; i != _new_number_of_workers - 1; --i) {
                this.#workers[i].terminate();

                this.#workers.pop();

                this.#jobs.unshift(this.#current_jobs[i]);

                this.#current_jobs.pop();
            }

        }

        this.#number_of_workers = _new_number_of_workers;
    }
    jobs_left() {
        return this.#jobs.length + this.#number_of_workers - this.#avaliable_workers_IDs.length;
    }
    static #free_worker(_instance, _id) {
        _instance.#avaliable_workers_IDs.push(_id);

        _instance.#current_jobs[_id] = null;
    }
    static #check_available_job(_instance) {

        if (_instance.#jobs.length === 0)
            return;

        _instance.send_job(_instance.#jobs.shift());
    }

    // Fields
    #number_of_workers;
    #jobs;
    #workers;
    #current_jobs;
    #avaliable_workers_IDs;
    #on_message;

}