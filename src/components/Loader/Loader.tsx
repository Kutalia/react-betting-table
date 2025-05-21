import classes from './Loader.module.css'

export const Loader = () => {
  return <div className="text-center relative top-1/2">
    <h1 className="text-2xl font-bold pb-12">Please wait a few seconds</h1>
    <div className={classes.loader}>
      <svg viewBox="0 0 80 80">
        <circle r="32" cy="40" cx="40" id="test"></circle>
      </svg>
    </div>

    <div className={`${classes.loader} ${classes.triangle}`}>
      <svg viewBox="0 0 86 80">
        <polygon points="43 8 79 72 7 72"></polygon>
      </svg>
    </div>

    <div className={classes.loader}>
      <svg viewBox="0 0 80 80">
        <rect height="64" width="64" y="8" x="8"></rect>
      </svg>
    </div>
  </div>
}