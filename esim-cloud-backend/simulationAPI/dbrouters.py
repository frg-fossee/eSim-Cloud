from simulationAPI import models
allmodels = dict([(name.lower(), cls) for name, cls in models.__dict__.items() if isinstance(cls, type)])

class to_mongo(object):
    def db_for_read(self, model, **hints):
        """ reading model based on params """
        return getattr(model.params, 'use_db')

    def db_for_write(self, model, **hints):
        """ writing model based on params """
        return getattr(model.params, 'use_db')

